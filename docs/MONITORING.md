# Monitoring and alerts

All of this is the CDK stack `ForkzeroAi-Monitoring`
(`infra/lib/monitoring-stack.ts`; Lambda code in `infra/analytics-report/`).

Changes under `infra/` deploy through `.github/workflows/infra.yml` on push to
`main` (diff in the run summary, then deploy after approval on the `infra`
environment); see `infra/README.md`. Locally:

```bash
make infra-diff   REPORT_EMAIL=you@example.com   # preview changes
make infra-deploy REPORT_EMAIL=you@example.com   # typecheck, test, deploy
```

`ALERT_EMAIL` is optional (defaults to `REPORT_EMAIL`). Emails are passed at
deploy time so they stay out of the repo; the stack refuses to synthesize
without them, so a deploy can't silently drop the subscriptions. Redeploy after
changing anything under `infra/analytics-report/`, or
`infra/cloudfront-url-rewrite.js` / `infra/cloudfront-site-paths.json` (the
monitor's drift check bundles them). New email subscriptions must be confirmed
from the inbox.

CloudFront, S3 hosting and the subscribe endpoint are still managed by the
`infra/setup-*.sh` scripts until they move into CDK.

**One-time migration (Nov 2026):** the daily report used to be hand-made
resources (`forkzero-daily-analytics` Lambda, topic, role and rule). After the
first deploy, confirm both new subscriptions, wait for the first
`forkzero-daily-report` email, then remove the old resources with
`./infra/scripts/remove-legacy-analytics.sh` (it refuses to run until the stack
is deployed and the new subscription is confirmed). Until then you get two
daily emails.

## What runs

| What | When | Where it reports |
|---|---|---|
| **Monitor** (`forkzero-monitor` Lambda) | Every 5 minutes | CloudWatch metrics `Forkzero/Monitor` → alarms → `forkzero-alerts` email |
| **Daily report** (`forkzero-daily-report` Lambda) | 10:00 UTC | `forkzero-daily-report` email; opens with the same health checks |
| **Deploy / CI failure alert** (`.github/workflows/deploy.yml`) | When a deploy, its smoke tests, or CI on `main` fails | `forkzero-alerts` email |

The monitor checks (`infra/analytics-report/checks.mjs`):

- every URL in `/sitemap.xml` returns 200 HTML that is not the 404 page
- every JS/CSS file those pages reference returns 200
- `/lattice/install.sh` and `/lattice/install.ps1` are scripts, not HTML
- `/getting-started` and `/blog/` 301 to the right place
- an unknown path returns the 404 page with status 404
- `/robots.txt`, `/llms.txt`, the subscribe API (rejects a request without
  `Origin`), and at least 14 days left on the TLS certificate
- **CloudFront drift**: the live `forkzero-url-rewrite` function equals
  `infra/cloudfront-url-rewrite.js`, and the distribution has the behaviors in
  `infra/cloudfront-site-paths.json` (ahead of `lattice/*`, on the site bucket,
  with the function), the security headers policy and the 404 error page

Monitor requests use the user agent `forkzero-monitor/1.0`, which the daily
report excludes from traffic numbers.

## Alarms

| Alarm | Fires when | Clears |
|---|---|---|
| `forkzero-health-checks-failing` | Any check failed in 2 of the last 3 runs (~10 min) | Checks pass again (you get an OK email) |
| `forkzero-monitor-not-running` | No monitor run recorded for 15 minutes | The monitor reports again |
| `forkzero-daily-report-failed` | The daily report Lambda errored (so no report email was sent) | After an hour without errors |

## When an alert arrives

1. **See what is failing:**
   `aws logs tail /aws/lambda/forkzero-monitor --since 30m`
   or run it now:
   `aws lambda invoke --function-name forkzero-monitor /tmp/m.json && jq -r '.checks[] | select(.ok|not)' /tmp/m.json`
2. **"CloudFront … matches repo" failing:** the live edge differs from the repo,
   usually because `infra/setup-cloudfront.sh` was not run after a change, or
   someone changed the distribution elsewhere. Read the detail, then run
   `./infra/setup-cloudfront.sh`.
3. **A page or asset failing:** check the latest Deploy run in GitHub Actions;
   a partial or failed deploy is the usual cause. Redeploy by re-running it.
4. **Installer failing:** it is served from the `forkzero-lattice-prod` bucket
   via the `lattice/*` behavior, published from the lattice repo.
5. **Deploy failed:** the alert links the run. The site may be partly updated;
   fix and push, or re-run the last good deploy.
6. **Monitor not running:** look for Lambda errors in its log group and confirm
   its EventBridge schedule (in the `ForkzeroAi-Monitoring` stack) is enabled.
7. **Daily report failed:** `aws logs tail /aws/lambda/forkzero-daily-report --since 1d`;
   usually an Athena or permissions error. Re-run with
   `aws lambda invoke --function-name forkzero-daily-report /tmp/r.json`.

## Paging

Alerts go to the `forkzero-alerts` SNS topic, which emails `ALERT_EMAIL`. To
page instead, add a subscription to that topic in `monitoring-stack.ts`: for
example a PagerDuty CloudWatch integration (`subs.UrlSubscription` to its
HTTPS endpoint), or a small forwarder Lambda for Pushover or ntfy.
