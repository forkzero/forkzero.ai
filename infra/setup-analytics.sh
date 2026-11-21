#!/usr/bin/env bash
set -euo pipefail

# ===========================================================================
# Daily analytics pipeline setup for forkzero.ai
# Creates: SNS topic, IAM role, Lambda function, EventBridge scheduled rule
#
# Prerequisites:
#   - AWS CLI v2 configured with appropriate credentials
#   - jq installed
#
# Environment variables:
#   ANALYTICS_EMAIL — email address for daily report
#
# Usage:
#   chmod +x infra/setup-analytics.sh
#   ANALYTICS_EMAIL=you@example.com ./infra/setup-analytics.sh
# ===========================================================================

REGION="${AWS_DEFAULT_REGION:-us-east-1}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

TOPIC_NAME="forkzero-daily-analytics"
ROLE_NAME="forkzero-analytics-lambda-role"
FUNCTION_NAME="forkzero-daily-analytics"
RULE_NAME="forkzero-daily-analytics-5am"
LAMBDA_DIR="${SCRIPT_DIR}/analytics-report"

ATHENA_DATABASE="forkzero"
ATHENA_OUTPUT="s3://forkzero-athena-results/"
LOGS_BUCKET="forkzero-web-prod-logs"
RESULTS_BUCKET="forkzero-athena-results"

# ---- Validate email ----
if [ -z "${ANALYTICS_EMAIL:-}" ]; then
  echo "Error: Set ANALYTICS_EMAIL env var (e.g. you@example.com)"
  exit 1
fi

# ---- 1. SNS Topic + SMS Subscription ----
echo "==> Creating SNS topic: ${TOPIC_NAME}"

TOPIC_ARN=$(aws sns create-topic \
  --name "${TOPIC_NAME}" \
  --query 'TopicArn' --output text)
echo "    Topic ARN: ${TOPIC_ARN}"

echo "    Subscribing ${ANALYTICS_EMAIL} for email..."
aws sns subscribe \
  --topic-arn "${TOPIC_ARN}" \
  --protocol email \
  --notification-endpoint "${ANALYTICS_EMAIL}" \
  --output text > /dev/null

echo "    Email subscription created (check inbox to confirm)."

# ---- 2. IAM Role for Lambda ----
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

# Attach managed policy for Athena + Glue
echo "    Attaching AmazonAthenaFullAccess..."
aws iam attach-role-policy \
  --role-name "${ROLE_NAME}" \
  --policy-arn "arn:aws:iam::aws:policy/AmazonAthenaFullAccess" 2>/dev/null || true

# Attach CloudWatch Logs
echo "    Attaching CloudWatch Logs..."
aws iam attach-role-policy \
  --role-name "${ROLE_NAME}" \
  --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" 2>/dev/null || true

# Inline policy for S3 + SNS
echo "    Attaching inline policy for S3 + SNS..."
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
    }
  ]
}
EOF
)

aws iam put-role-policy \
  --role-name "${ROLE_NAME}" \
  --policy-name "forkzero-analytics-s3-sns" \
  --policy-document "${INLINE_POLICY}"

# IAM role propagation
echo "    Waiting for IAM role to propagate..."
sleep 10

# ---- 3. Lambda Function ----
echo ""
echo "==> Deploying Lambda function: ${FUNCTION_NAME}"

ZIP_FILE="/tmp/${FUNCTION_NAME}.zip"
(cd "${LAMBDA_DIR}" && zip -j "${ZIP_FILE}" index.mjs)

# Create or update
if aws lambda get-function --function-name "${FUNCTION_NAME}" > /dev/null 2>&1; then
  echo "    Updating existing function..."
  aws lambda update-function-code \
    --function-name "${FUNCTION_NAME}" \
    --zip-file "fileb://${ZIP_FILE}" \
    --output text > /dev/null

  aws lambda update-function-configuration \
    --function-name "${FUNCTION_NAME}" \
    --timeout 60 \
    --memory-size 128 \
    --environment "Variables={SNS_TOPIC_ARN=${TOPIC_ARN},ATHENA_DATABASE=${ATHENA_DATABASE},ATHENA_OUTPUT=${ATHENA_OUTPUT}}" \
    --output text > /dev/null
else
  echo "    Creating new function..."
  aws lambda create-function \
    --function-name "${FUNCTION_NAME}" \
    --runtime nodejs22.x \
    --role "${ROLE_ARN}" \
    --handler index.handler \
    --zip-file "fileb://${ZIP_FILE}" \
    --timeout 60 \
    --memory-size 128 \
    --environment "Variables={SNS_TOPIC_ARN=${TOPIC_ARN},ATHENA_DATABASE=${ATHENA_DATABASE},ATHENA_OUTPUT=${ATHENA_OUTPUT}}" \
    --output text > /dev/null
fi

LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}"
echo "    Lambda ARN: ${LAMBDA_ARN}"

rm -f "${ZIP_FILE}"

# ---- 4. EventBridge Scheduled Rule ----
echo ""
echo "==> Creating EventBridge rule: ${RULE_NAME}"

# 10:00 UTC = 5:00 AM ET (EST; 4:00 AM during EDT, close enough)
aws events put-rule \
  --name "${RULE_NAME}" \
  --schedule-expression "cron(0 10 * * ? *)" \
  --state ENABLED \
  --description "Trigger daily analytics report for forkzero.ai at 5am ET" \
  --output text > /dev/null

echo "    Adding Lambda target..."
aws events put-targets \
  --rule "${RULE_NAME}" \
  --targets "Id=daily-analytics,Arn=${LAMBDA_ARN}" \
  --output text > /dev/null

echo "    Adding Lambda invoke permission for EventBridge..."
aws lambda add-permission \
  --function-name "${FUNCTION_NAME}" \
  --statement-id "eventbridge-daily-analytics" \
  --action "lambda:InvokeFunction" \
  --principal events.amazonaws.com \
  --source-arn "arn:aws:events:${REGION}:${ACCOUNT_ID}:rule/${RULE_NAME}" \
  2>/dev/null || true

# ---- Done ----
echo ""
echo "==========================================================================="
echo "Setup complete!"
echo ""
echo "Resources created:"
echo "  SNS topic:        ${TOPIC_ARN}"
echo "  IAM role:         ${ROLE_ARN}"
echo "  Lambda function:  ${LAMBDA_ARN}"
echo "  EventBridge rule: ${RULE_NAME} (daily at 10:00 UTC / 5:00 AM ET)"
echo ""
echo "To test manually:"
echo "  aws lambda invoke --function-name ${FUNCTION_NAME} /tmp/out.json && cat /tmp/out.json"
echo ""
echo "To check logs:"
echo "  aws logs tail /aws/lambda/${FUNCTION_NAME} --follow"
echo "==========================================================================="
