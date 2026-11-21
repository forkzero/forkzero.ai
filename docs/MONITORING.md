# Monitoring and alerts

All of this is created by `infra/setup-analytics.sh` (idempotent; re-run it
after changing anything under `infra/analytics-report/` or the CloudFront
files listed below).

## What runs

| What | When | Where it reports |
|---|---|---|
| **Monitor** (`forkzero-monitor` Lambda, `monitor.handler`) | Every 5 minutes | CloudWatch metrics `Forkzero/Monitor` → alarms → `forkzero-alerts` email |
| **Daily report** (`forkzero-daily-analytics`, `index.handler`) | 10:00 UTC | `forkzero-daily-analytics` email; opens with the same health checks |
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
   the `forkzero-monitor-5min` EventBridge rule is enabled.

## Paging

Alerts go to the `forkzero-alerts` SNS topic, which emails `ALERT_EMAIL`. To
page instead, add a subscription to that topic (no code changes): for example a
PagerDuty CloudWatch integration (HTTPS endpoint), or a small forwarder Lambda
for Pushover or ntfy.
