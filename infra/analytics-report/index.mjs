/**
 * Daily analytics report for forkzero.ai
 *
 * Queries Athena against CloudFront access logs for yesterday's data,
 * formats a concise SMS summary, and publishes it via SNS.
 *
 * Opens with the health checks from monitor.mjs (sitemap pages, installer,
 * redirects, 404 page, subscribe API, TLS, CloudFront drift); any failure is
 * listed first and flagged in the subject line.
 *
 * Environment variables:
 *   SNS_TOPIC_ARN   — ARN of the SNS topic to publish to
 *   ATHENA_DATABASE — Athena database name (default: forkzero)
 *   ATHENA_OUTPUT   — S3 path for Athena query results
 *   plus DISTRIBUTION_ID and SUBSCRIBE_API_URL for the health checks
 */

import {
  AthenaClient,
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
} from "@aws-sdk/client-athena";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { runAllChecks } from "./monitor.mjs";
import { formatHealth } from "./checks.mjs";

const athena = new AthenaClient();
const sns = new SNSClient();

const TOPIC_ARN = process.env.SNS_TOPIC_ARN;
const DATABASE = process.env.ATHENA_DATABASE || "forkzero";
const OUTPUT = process.env.ATHENA_OUTPUT || "s3://forkzero-athena-results/";

const POLL_INTERVAL_MS = 1000;
const MAX_POLLS = 30;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runQuery(sql) {
  const start = await athena.send(
    new StartQueryExecutionCommand({
      QueryString: sql,
      QueryExecutionContext: { Database: DATABASE },
      ResultConfiguration: { OutputLocation: OUTPUT },
    })
  );
  const executionId = start.QueryExecutionId;

  for (let i = 0; i < MAX_POLLS; i++) {
    const resp = await athena.send(
      new GetQueryExecutionCommand({ QueryExecutionId: executionId })
    );
    const state = resp.QueryExecution.Status.State;

    if (state === "SUCCEEDED") break;
    if (state === "FAILED" || state === "CANCELLED") {
      const reason = resp.QueryExecution.Status.StateChangeReason || "";
      throw new Error(`Query ${state}: ${reason}`);
    }
    await sleep(POLL_INTERVAL_MS);
  }

  const results = await athena.send(
    new GetQueryResultsCommand({ QueryExecutionId: executionId })
  );
  const rows = results.ResultSet.Rows;
  const header = rows[0].Data.map((col) => col.VarCharValue);

  return rows.slice(1).map((row) => {
    const obj = {};
    row.Data.forEach((col, i) => {
      obj[header[i]] = col.VarCharValue || "";
    });
    return obj;
  });
}

function yesterday() {
  const dt = new Date(Date.now() - 86400000);
  const year = dt.getUTCFullYear().toString();
  const month = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dt.getUTCDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;
  const display = dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  return { dateStr, display };
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 2) + ".." : str;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}

async function buildReport(dateOverride) {
  const health = await checkHealth();
  const { dateStr, display } = dateOverride
    ? { dateStr: dateOverride, display: dateOverride }
    : yesterday();
  // Exclude the 5-minute monitor's own requests (user agent from checks.mjs)
  const dateFilter = `"date" = DATE '${dateStr}' AND cs_user_agent NOT LIKE 'forkzero-monitor%'`;

  // 1. Overview: requests, unique IPs, bandwidth
  const overview = await runQuery(`
    SELECT COUNT(*) AS total_requests,
           COUNT(DISTINCT c_ip) AS unique_ips,
           SUM(sc_bytes) AS total_bytes
    FROM cloudfront_logs
    WHERE ${dateFilter}
  `);
  const total = overview[0]?.total_requests || "0";
  const unique = overview[0]?.unique_ips || "0";
  const totalBytes = parseInt(overview[0]?.total_bytes || "0", 10);

  // 2. Status code breakdown
  const statuses = await runQuery(`
    SELECT CASE
             WHEN sc_status BETWEEN 200 AND 299 THEN '2xx'
             WHEN sc_status BETWEEN 300 AND 399 THEN '3xx'
             WHEN sc_status BETWEEN 400 AND 499 THEN '4xx'
             WHEN sc_status BETWEEN 500 AND 599 THEN '5xx'
             ELSE 'other'
           END AS status_group,
           COUNT(*) AS cnt
    FROM cloudfront_logs
    WHERE ${dateFilter}
    GROUP BY 1
    ORDER BY 1
  `);

  // 3. Cache hit rate
  const cache = await runQuery(`
    SELECT x_edge_result_type AS result_type, COUNT(*) AS cnt
    FROM cloudfront_logs
    WHERE ${dateFilter}
    GROUP BY x_edge_result_type
    ORDER BY cnt DESC
  `);

  // 4. Top 10 pages by hits (exclude static assets)
  const pages = await runQuery(`
    SELECT cs_uri_stem AS uri, COUNT(*) AS hits
    FROM cloudfront_logs
    WHERE ${dateFilter}
      AND cs_uri_stem NOT LIKE '%.js'
      AND cs_uri_stem NOT LIKE '%.css'
      AND cs_uri_stem NOT LIKE '%.png'
      AND cs_uri_stem NOT LIKE '%.jpg'
      AND cs_uri_stem NOT LIKE '%.ico'
      AND cs_uri_stem NOT LIKE '%.svg'
      AND cs_uri_stem NOT LIKE '%.woff%'
      AND cs_uri_stem NOT LIKE '%.ttf'
      AND cs_uri_stem NOT LIKE '%.map'
      AND cs_uri_stem NOT LIKE '%.json'
      AND cs_uri_stem NOT LIKE '%.xml'
      AND cs_uri_stem NOT LIKE '%.txt'
    GROUP BY cs_uri_stem
    ORDER BY hits DESC
    LIMIT 10
  `);

  // 5. Top 5 referrers
  const referrers = await runQuery(`
    SELECT cs_referer AS referrer, COUNT(*) AS hits
    FROM cloudfront_logs
    WHERE ${dateFilter}
      AND cs_referer != '-'
      AND cs_referer NOT LIKE '%forkzero.ai%'
    GROUP BY cs_referer
    ORDER BY hits DESC
    LIMIT 5
  `);

  // 6. Top 5 user agents (excluding bots)
  const agents = await runQuery(`
    SELECT cs_user_agent AS useragent, COUNT(*) AS hits
    FROM cloudfront_logs
    WHERE ${dateFilter}
      AND cs_user_agent NOT LIKE '%bot%'
      AND cs_user_agent NOT LIKE '%Bot%'
      AND cs_user_agent NOT LIKE '%spider%'
      AND cs_user_agent NOT LIKE '%crawl%'
      AND cs_user_agent NOT LIKE '%Crawl%'
    GROUP BY cs_user_agent
    ORDER BY hits DESC
    LIMIT 5
  `);

  // 7. Bot traffic
  const bots = await runQuery(`
    SELECT cs_user_agent AS bot, COUNT(*) AS hits
    FROM cloudfront_logs
    WHERE ${dateFilter}
      AND (cs_user_agent LIKE '%bot%'
        OR cs_user_agent LIKE '%Bot%'
        OR cs_user_agent LIKE '%spider%'
        OR cs_user_agent LIKE '%crawl%'
        OR cs_user_agent LIKE '%Crawl%')
    GROUP BY cs_user_agent
    ORDER BY hits DESC
    LIMIT 5
  `);

  // 8. Hourly traffic distribution
  const hourly = await runQuery(`
    SELECT SUBSTR("time", 1, 2) AS hour, COUNT(*) AS hits
    FROM cloudfront_logs
    WHERE ${dateFilter}
    GROUP BY SUBSTR("time", 1, 2)
    ORDER BY hour
  `);

  // Format report
  const lines = [`forkzero.ai — ${display}`, "", ...health.lines, ""];
  lines.push(`Requests: ${total} | Unique IPs: ${unique} | Bandwidth: ${formatBytes(totalBytes)}`);

  // Status codes
  if (statuses.length) {
    const statusStr = statuses.map((s) => `${s.status_group}:${s.cnt}`).join("  ");
    lines.push(`Status: ${statusStr}`);
  }

  // Cache performance
  if (cache.length) {
    const totalCache = cache.reduce((sum, c) => sum + parseInt(c.cnt, 10), 0);
    const hits = cache
      .filter((c) => c.result_type === "Hit" || c.result_type === "RefreshHit")
      .reduce((sum, c) => sum + parseInt(c.cnt, 10), 0);
    const hitRate = totalCache > 0 ? ((hits / totalCache) * 100).toFixed(0) : "0";
    const cacheStr = cache.map((c) => `${c.result_type}:${c.cnt}`).join("  ");
    lines.push(`Cache hit rate: ${hitRate}% (${cacheStr})`);
  }

  // Hourly traffic sparkline
  if (hourly.length) {
    const bars = "▁▂▃▄▅▆▇█";
    const counts = Array(24).fill(0);
    for (const h of hourly) counts[parseInt(h.hour, 10)] = parseInt(h.hits, 10);
    const max = Math.max(...counts, 1);
    const spark = counts.map((c) => bars[Math.min(Math.round((c / max) * 8), 8)]).join("");
    lines.push(`Hourly: ${spark} (0h→23h UTC)`);
  }

  lines.push("");

  if (pages.length) {
    lines.push("Top pages:");
    for (const p of pages) {
      lines.push(`  ${p.hits.toString().padStart(4)} ${truncate(p.uri, 30)}`);
    }
  }

  if (referrers.length) {
    lines.push("Referrers:");
    for (const r of referrers) {
      const ref = r.referrer
        .replace("https://", "")
        .replace("http://", "")
        .replace(/\/$/, "");
      lines.push(`  ${r.hits.toString().padStart(4)} ${truncate(ref, 30)}`);
    }
  }

  if (agents.length) {
    lines.push("User agents:");
    for (const a of agents) {
      lines.push(`  ${a.hits.toString().padStart(4)} ${truncate(a.useragent, 40)}`);
    }
  }

  if (bots.length) {
    const botTotal = bots.reduce((sum, b) => sum + parseInt(b.hits, 10), 0);
    lines.push(`Bots (${botTotal} reqs):`);
    for (const b of bots) {
      lines.push(`  ${b.hits.toString().padStart(4)} ${truncate(b.bot, 40)}`);
    }
  }

  return { report: lines.join("\n"), failing: health.failing };
}

/** Current health (checked now, not for the report date). Never throws. */
async function checkHealth() {
  try {
    const checks = await runAllChecks();
    return { lines: formatHealth(checks), failing: checks.filter((c) => !c.ok).length };
  } catch (err) {
    return { lines: [`⚠ HEALTH: checks could not run: ${err?.message || err}`], failing: 1 };
  }
}

export async function handler(event) {
  const { report, failing } = await buildReport(event?.dateOverride);
  console.log(report);

  await sns.send(
    new PublishCommand({
      TopicArn: TOPIC_ARN,
      Message: report,
      Subject: failing
        ? // SNS subjects must be ASCII
          `[ALERT] forkzero.ai: ${failing} health check${failing === 1 ? "" : "s"} failing`
        : "forkzero.ai daily analytics",
    })
  );

  return { statusCode: 200, body: report };
}
