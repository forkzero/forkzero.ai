/**
 * 5-minute health monitor for forkzero.ai (Lambda handler: monitor.handler).
 *
 * Runs the route and CloudFront drift checks from checks.mjs and publishes
 * two CloudWatch metrics in the Forkzero/Monitor namespace:
 *   FailingChecks — number of failing checks (alarm: >= 1 twice in a row)
 *   ChecksRun     — 1 per run (alarm: none for 15 minutes = monitor stopped)
 * Both alarms notify the forkzero-alerts SNS topic (see setup-analytics.sh).
 *
 * The deploy package also contains cloudfront-url-rewrite.js and
 * cloudfront-site-paths.json, copied from infra/ by setup-analytics.sh, which
 * the drift checks compare against the live distribution.
 *
 * Environment variables:
 *   DISTRIBUTION_ID   — CloudFront distribution for forkzero.ai
 *   SUBSCRIBE_API_URL — subscribe endpoint (from src/constants.ts)
 *   SITE_URL          — optional, defaults to https://forkzero.ai
 */

import { readFileSync } from "node:fs";
import { CloudFrontClient, GetFunctionCommand, GetDistributionConfigCommand } from "@aws-sdk/client-cloudfront";
import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import { runRouteChecks, runDriftChecks, formatHealth } from "./checks.mjs";

const cloudfront = new CloudFrontClient({ region: "us-east-1" });
const cloudwatch = new CloudWatchClient();

const FUNCTION_NAME = "forkzero-url-rewrite";

function readPackaged(file) {
  return readFileSync(new URL(`./${file}`, import.meta.url), "utf-8");
}

/** All checks: what visitors see, plus live CloudFront vs the repo. */
export async function runAllChecks() {
  const [routes, drift] = await Promise.all([
    runRouteChecks({
      baseUrl: process.env.SITE_URL || "https://forkzero.ai",
      subscribeApiUrl: process.env.SUBSCRIBE_API_URL,
    }),
    runDriftChecks({
      expectedFunctionCode: readPackaged("cloudfront-url-rewrite.js"),
      sitePaths: JSON.parse(readPackaged("cloudfront-site-paths.json")),
      functionName: FUNCTION_NAME,
      getLiveFunctionCode: async () => {
        const res = await cloudfront.send(new GetFunctionCommand({ Name: FUNCTION_NAME, Stage: "LIVE" }));
        return Buffer.from(res.FunctionCode).toString("utf-8");
      },
      getDistributionConfig: async () => {
        const res = await cloudfront.send(new GetDistributionConfigCommand({ Id: process.env.DISTRIBUTION_ID }));
        return res.DistributionConfig;
      },
    }),
  ]);
  return [...routes, ...drift];
}

export async function handler() {
  const checks = await runAllChecks();
  const failing = checks.filter((c) => !c.ok).length;

  await cloudwatch.send(
    new PutMetricDataCommand({
      Namespace: "Forkzero/Monitor",
      MetricData: [
        { MetricName: "FailingChecks", Value: failing, Unit: "Count" },
        { MetricName: "ChecksRun", Value: 1, Unit: "Count" },
      ],
    }),
  );

  const summary = formatHealth(checks).join("\n");
  // Failures go to the log so the alarm email can point at them
  (failing ? console.error : console.log)(summary);
  return { failing, total: checks.length, checks };
}
