#!/usr/bin/env bash
set -euo pipefail

# ===========================================================================
# Analytics and monitoring setup for forkzero.ai (idempotent; safe to re-run)
#
# Daily report:
#   SNS topic forkzero-daily-analytics (email), Lambda forkzero-daily-analytics
#   (index.handler), EventBridge rule at 10:00 UTC. Athena over CloudFront logs,
#   opening with the health checks below.
#
# 5-minute monitor and alerts:
#   Lambda forkzero-monitor (monitor.handler) on an EventBridge rate(5 minutes)
#   rule. It checks sitemap pages, page assets, installer, redirects, 404 page,
#   subscribe API, TLS, and live CloudFront vs the repo, and publishes
#   Forkzero/Monitor metrics. Two CloudWatch alarms notify the
#   forkzero-alerts SNS topic (email) on failure and on recovery:
#     forkzero-health-checks-failing — failing checks in 2 of the last 3 runs
#     forkzero-monitor-not-running   — no monitor run for 15 minutes
#   The GitHub Actions deploy user may publish to forkzero-alerts (deploy.yml
#   alerts on failed deploys and failed CI on main).
#
# Both Lambdas share one package: infra/analytics-report/*.mjs plus
# infra/cloudfront-url-rewrite.js and infra/cloudfront-site-paths.json, which
# the drift check compares against the live distribution.
#
# Prerequisites:
#   - AWS CLI v2 configured with appropriate credentials
#   - jq and zip installed
#
# Environment variables:
#   ANALYTICS_EMAIL — email address for the daily report
#   ALERT_EMAIL     — email address for alerts (default: ANALYTICS_EMAIL)
#
# Usage:
#   ANALYTICS_EMAIL=you@example.com ./infra/setup-analytics.sh
# New email subscriptions must be confirmed from the inbox.
# ===========================================================================

REGION="${AWS_DEFAULT_REGION:-us-east-1}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

TOPIC_NAME="forkzero-daily-analytics"
ROLE_NAME="forkzero-analytics-lambda-role"
FUNCTION_NAME="forkzero-daily-analytics"
RULE_NAME="forkzero-daily-analytics-5am"
LAMBDA_DIR="${SCRIPT_DIR}/analytics-report"

ALERTS_TOPIC_NAME="forkzero-alerts"
MONITOR_FUNCTION_NAME="forkzero-monitor"
MONITOR_RULE_NAME="forkzero-monitor-5min"
DEPLOY_USER="github-actions-deploy-forkzero-ai"
CF_FUNCTION_NAME="forkzero-url-rewrite"
DOMAIN="forkzero.ai"

ATHENA_DATABASE="forkzero"
ATHENA_OUTPUT="s3://forkzero-athena-results/"
LOGS_BUCKET="forkzero-web-prod-logs"
RESULTS_BUCKET="forkzero-athena-results"

# ---- Validate inputs ----
if [ -z "${ANALYTICS_EMAIL:-}" ]; then
  echo "Error: Set ANALYTICS_EMAIL env var (e.g. you@example.com)"
  exit 1
fi
ALERT_EMAIL="${ALERT_EMAIL:-${ANALYTICS_EMAIL}}"

DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Aliases.Items[?@=='${DOMAIN}']].Id | [0]" \
  --output text)
if [ -z "${DIST_ID}" ] || [ "${DIST_ID}" = "None" ]; then
  echo "Error: No CloudFront distribution found for ${DOMAIN}" >&2
  exit 1
fi

SUBSCRIBE_API_URL=$(sed -n "s/^export const SUBSCRIBE_API_URL = '\(.*\)'$/\1/p" "${REPO_DIR}/src/constants.ts")
if [ -z "${SUBSCRIBE_API_URL}" ]; then
  echo "Error: Could not read SUBSCRIBE_API_URL from src/constants.ts" >&2
  exit 1
fi

# ---- 1. SNS topics + email subscriptions ----
echo "==> Creating SNS topics"

TOPIC_ARN=$(aws sns create-topic --name "${TOPIC_NAME}" --query 'TopicArn' --output text)
ALERTS_TOPIC_ARN=$(aws sns create-topic --name "${ALERTS_TOPIC_NAME}" --query 'TopicArn' --output text)
echo "    Report topic: ${TOPIC_ARN}"
echo "    Alerts topic: ${ALERTS_TOPIC_ARN}"

subscribe_email() {
  local topic_arn="$1" email="$2"
  local existing
  existing=$(aws sns list-subscriptions-by-topic --topic-arn "${topic_arn}" \
    --query "Subscriptions[?Protocol=='email' && Endpoint=='${email}'].SubscriptionArn | [0]" --output text)
  if [ "${existing}" = "None" ] || [ -z "${existing}" ]; then
    aws sns subscribe --topic-arn "${topic_arn}" --protocol email \
      --notification-endpoint "${email}" --output text > /dev/null
    echo "    Subscribed ${email} to ${topic_arn##*:} (confirm from the inbox)"
  elif [ "${existing}" = "PendingConfirmation" ]; then
    echo "    ${email} on ${topic_arn##*:} is awaiting confirmation (check the inbox)"
  else
    echo "    ${email} already subscribed to ${topic_arn##*:}"
  fi
}

subscribe_email "${TOPIC_ARN}" "${ANALYTICS_EMAIL}"
subscribe_email "${ALERTS_TOPIC_ARN}" "${ALERT_EMAIL}"

# ---- 2. IAM role for both Lambdas ----
echo ""
echo "==> Creating IAM role: ${ROLE_NAME}"

TRUST_POLICY=$(cat <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
)

ROLE_ARN=$(aws iam create-role \
  --role-name "${ROLE_NAME}" \
  --assume-role-policy-document "${TRUST_POLICY}" \
  --query 'Role.Arn' --output text 2>/dev/null || \
  aws iam get-role --role-name "${ROLE_NAME}" --query 'Role.Arn' --output text)
echo "    Role ARN: ${ROLE_ARN}"

echo "    Attaching AmazonAthenaFullAccess..."
aws iam attach-role-policy \
  --role-name "${ROLE_NAME}" \
  --policy-arn "arn:aws:iam::aws:policy/AmazonAthenaFullAccess"

echo "    Attaching CloudWatch Logs..."
aws iam attach-role-policy \
  --role-name "${ROLE_NAME}" \
  --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"

echo "    Attaching inline policy (S3, SNS, CloudFront read, CloudWatch metrics)..."
INLINE_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3ReadLogs",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::${LOGS_BUCKET}",
        "arn:aws:s3:::${LOGS_BUCKET}/*"
      ]
    },
    {
      "Sid": "S3AthenaResults",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:ListBucket", "s3:GetBucketLocation"],
      "Resource": [
        "arn:aws:s3:::${RESULTS_BUCKET}",
        "arn:aws:s3:::${RESULTS_BUCKET}/*"
      ]
    },
    {
      "Sid": "SNSPublish",
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "${TOPIC_ARN}"
    },
    {
      "Sid": "CloudFrontDriftRead",
      "Effect": "Allow",
      "Action": ["cloudfront:GetFunction", "cloudfront:GetDistributionConfig"],
      "Resource": [
        "arn:aws:cloudfront::${ACCOUNT_ID}:function/${CF_FUNCTION_NAME}",
        "arn:aws:cloudfront::${ACCOUNT_ID}:distribution/${DIST_ID}"
      ]
    },
    {
      "Sid": "MonitorMetrics",
      "Effect": "Allow",
      "Action": "cloudwatch:PutMetricData",
      "Resource": "*",
      "Condition": { "StringEquals": { "cloudwatch:namespace": "Forkzero/Monitor" } }
    }
  ]
}
EOF
)

aws iam put-role-policy \
  --role-name "${ROLE_NAME}" \
  --policy-name "forkzero-analytics-s3-sns" \
  --policy-document "${INLINE_POLICY}"

echo "    Waiting for IAM changes to propagate..."
sleep 10

# ---- 3. Lambda package (shared by both functions) ----
echo ""
echo "==> Building Lambda package"

BUILD_DIR=$(mktemp -d)
trap 'rm -rf "${BUILD_DIR}"' EXIT
cp "${LAMBDA_DIR}/index.mjs" "${LAMBDA_DIR}/checks.mjs" "${LAMBDA_DIR}/monitor.mjs" "${BUILD_DIR}/"
cp "${SCRIPT_DIR}/cloudfront-url-rewrite.js" "${SCRIPT_DIR}/cloudfront-site-paths.json" "${BUILD_DIR}/"
ZIP_FILE="${BUILD_DIR}/package.zip"
(cd "${BUILD_DIR}" && zip -q package.zip index.mjs checks.mjs monitor.mjs cloudfront-url-rewrite.js cloudfront-site-paths.json)

ENVIRONMENT=$(jq -nc \
  --arg sns "${TOPIC_ARN}" --arg db "${ATHENA_DATABASE}" --arg out "${ATHENA_OUTPUT}" \
  --arg dist "${DIST_ID}" --arg api "${SUBSCRIBE_API_URL}" \
  '{Variables: {SNS_TOPIC_ARN: $sns, ATHENA_DATABASE: $db, ATHENA_OUTPUT: $out, DISTRIBUTION_ID: $dist, SUBSCRIBE_API_URL: $api}}')

# deploy_function NAME HANDLER TIMEOUT
deploy_function() {
  local name="$1" handler="$2" timeout="$3"
  if aws lambda get-function --function-name "${name}" > /dev/null 2>&1; then
    echo "    Updating ${name}..."
    aws lambda update-function-code --function-name "${name}" \
      --zip-file "fileb://${ZIP_FILE}" --output text > /dev/null
    aws lambda wait function-updated --function-name "${name}"
    aws lambda update-function-configuration --function-name "${name}" \
      --handler "${handler}" --timeout "${timeout}" --memory-size 256 \
      --environment "${ENVIRONMENT}" --output text > /dev/null
    aws lambda wait function-updated --function-name "${name}"
  else
    echo "    Creating ${name}..."
    aws lambda create-function --function-name "${name}" \
      --runtime nodejs22.x --role "${ROLE_ARN}" --handler "${handler}" \
      --zip-file "fileb://${ZIP_FILE}" --timeout "${timeout}" --memory-size 256 \
      --environment "${ENVIRONMENT}" --output text > /dev/null
    aws lambda wait function-active-v2 --function-name "${name}"
  fi
}

# schedule_function NAME RULE EXPRESSION DESCRIPTION
schedule_function() {
  local name="$1" rule="$2" expression="$3" description="$4"
  aws events put-rule --name "${rule}" --schedule-expression "${expression}" \
    --state ENABLED --description "${description}" --output text > /dev/null
  aws events put-targets --rule "${rule}" \
    --targets "Id=${name},Arn=arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${name}" \
    --output text > /dev/null
  aws lambda add-permission --function-name "${name}" \
    --statement-id "eventbridge-${rule}" --action "lambda:InvokeFunction" \
    --principal events.amazonaws.com \
    --source-arn "arn:aws:events:${REGION}:${ACCOUNT_ID}:rule/${rule}" \
    > /dev/null 2>&1 || true
}

# ---- 4. Daily report Lambda + schedule ----
echo ""
echo "==> Deploying daily report: ${FUNCTION_NAME}"
deploy_function "${FUNCTION_NAME}" "index.handler" 120

# 10:00 UTC = 5:00 AM ET (EST; 6:00 AM during EDT)
schedule_function "${FUNCTION_NAME}" "${RULE_NAME}" "cron(0 10 * * ? *)" \
  "Daily analytics report for forkzero.ai at 10:00 UTC"
# Keep the original target Id so re-runs don't leave a duplicate target
aws events remove-targets --rule "${RULE_NAME}" --ids daily-analytics > /dev/null 2>&1 || true

# ---- 5. Monitor Lambda + schedule ----
echo ""
echo "==> Deploying monitor: ${MONITOR_FUNCTION_NAME}"
deploy_function "${MONITOR_FUNCTION_NAME}" "monitor.handler" 60
schedule_function "${MONITOR_FUNCTION_NAME}" "${MONITOR_RULE_NAME}" "rate(5 minutes)" \
  "forkzero.ai health checks every 5 minutes"

# ---- 6. Alarms -> alerts topic ----
echo ""
echo "==> Creating CloudWatch alarms"

aws cloudwatch put-metric-alarm \
  --alarm-name "forkzero-health-checks-failing" \
  --alarm-description "forkzero.ai health checks failing. Details: aws logs tail /aws/lambda/${MONITOR_FUNCTION_NAME} --since 30m" \
  --namespace "Forkzero/Monitor" --metric-name "FailingChecks" \
  --statistic Maximum --period 300 \
  --evaluation-periods 3 --datapoints-to-alarm 2 \
  --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold \
  --treat-missing-data notBreaching \
  --alarm-actions "${ALERTS_TOPIC_ARN}" --ok-actions "${ALERTS_TOPIC_ARN}"
echo "    forkzero-health-checks-failing"

aws cloudwatch put-metric-alarm \
  --alarm-name "forkzero-monitor-not-running" \
  --alarm-description "The forkzero.ai monitor has not reported for 15 minutes. Check: aws logs tail /aws/lambda/${MONITOR_FUNCTION_NAME} --since 1h" \
  --namespace "Forkzero/Monitor" --metric-name "ChecksRun" \
  --statistic Sum --period 900 --evaluation-periods 1 \
  --threshold 1 --comparison-operator LessThanThreshold \
  --treat-missing-data breaching \
  --alarm-actions "${ALERTS_TOPIC_ARN}" --ok-actions "${ALERTS_TOPIC_ARN}"
echo "    forkzero-monitor-not-running"

# ---- 7. Let GitHub Actions publish deploy/CI failure alerts ----
echo ""
echo "==> Granting ${DEPLOY_USER} publish on ${ALERTS_TOPIC_NAME}"
aws iam put-user-policy \
  --user-name "${DEPLOY_USER}" \
  --policy-name "forkzero-ai-alerts-publish" \
  --policy-document "$(jq -nc --arg arn "${ALERTS_TOPIC_ARN}" \
    '{Version: "2012-10-17", Statement: [{Sid: "PublishAlerts", Effect: "Allow", Action: "sns:Publish", Resource: $arn}]}')"

# ---- Done ----
echo ""
echo "==========================================================================="
echo "Setup complete."
echo ""
echo "  Report topic:   ${TOPIC_ARN}  -> ${ANALYTICS_EMAIL}"
echo "  Alerts topic:   ${ALERTS_TOPIC_ARN}  -> ${ALERT_EMAIL}"
echo "  Daily report:   ${FUNCTION_NAME} (10:00 UTC)"
echo "  Monitor:        ${MONITOR_FUNCTION_NAME} (every 5 minutes)"
echo "  Alarms:         forkzero-health-checks-failing, forkzero-monitor-not-running"
echo ""
echo "Run the monitor once now:"
echo "  aws lambda invoke --function-name ${MONITOR_FUNCTION_NAME} /tmp/monitor.json && jq -r '.checks[] | select(.ok|not)' /tmp/monitor.json"
echo "==========================================================================="
