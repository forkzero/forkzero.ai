#!/usr/bin/env bash
set -euo pipefail

# ===========================================================================
# Subscribe endpoint setup for forkzero.ai
#
# Creates/updates:
#   1. DynamoDB table for subscriber emails
#   2. IAM role with DynamoDB write + CloudWatch Logs permissions
#   3. Lambda function with Function URL (public, CORS-enabled)
#
# Prerequisites:
#   - AWS CLI v2 configured with appropriate credentials
#   - jq installed
#
# Usage:
#   ./infra/setup-subscribe.sh
# ===========================================================================

REGION="${AWS_DEFAULT_REGION:-us-east-1}"
TABLE_NAME="forkzero-subscribers"
FUNCTION_NAME="forkzero-subscribe"
ROLE_NAME="forkzero-subscribe-lambda-role"
LAMBDA_DIR="$(dirname "$0")/subscribe"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "==> Region: ${REGION} | Account: ${ACCOUNT_ID}"

# ---- DynamoDB table ----
echo ""
echo "==> Creating DynamoDB table: ${TABLE_NAME}"

if aws dynamodb describe-table --table-name "${TABLE_NAME}" --region "${REGION}" > /dev/null 2>&1; then
  echo "    Table already exists."
else
  aws dynamodb create-table \
    --table-name "${TABLE_NAME}" \
    --attribute-definitions AttributeName=email,AttributeType=S \
    --key-schema AttributeName=email,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "${REGION}"
  echo "    Waiting for table to become active..."
  aws dynamodb wait table-exists --table-name "${TABLE_NAME}" --region "${REGION}"
  echo "    Table created."
fi

# Enable deletion protection and point-in-time recovery
echo "    Enabling deletion protection and PITR..."
aws dynamodb update-table \
  --table-name "${TABLE_NAME}" \
  --deletion-protection-enabled \
  --region "${REGION}" > /dev/null 2>&1 || true
aws dynamodb update-continuous-backups \
  --table-name "${TABLE_NAME}" \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true \
  --region "${REGION}" > /dev/null 2>&1 || true

# ---- IAM role ----
echo ""
echo "==> Creating IAM role: ${ROLE_NAME}"

TRUST_POLICY=$(cat <<'TRUST'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
TRUST
)

if aws iam get-role --role-name "${ROLE_NAME}" > /dev/null 2>&1; then
  echo "    Role already exists."
else
  aws iam create-role \
    --role-name "${ROLE_NAME}" \
    --assume-role-policy-document "${TRUST_POLICY}" \
    --output text --query 'Role.Arn'
  echo "    Waiting for role propagation..."
  sleep 10
fi

ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

# Attach CloudWatch Logs
aws iam attach-role-policy \
  --role-name "${ROLE_NAME}" \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole 2>/dev/null || true

# Inline policy for DynamoDB
DYNAMO_POLICY=$(cat <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["dynamodb:PutItem"],
    "Resource": "arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/${TABLE_NAME}"
  }]
}
POLICY
)

aws iam put-role-policy \
  --role-name "${ROLE_NAME}" \
  --policy-name "${FUNCTION_NAME}-dynamodb" \
  --policy-document "${DYNAMO_POLICY}"

echo "    Role configured: ${ROLE_ARN}"

# ---- Lambda function ----
echo ""
echo "==> Creating/updating Lambda: ${FUNCTION_NAME}"

# Package
ZIPFILE="/tmp/${FUNCTION_NAME}.zip"
(cd "${LAMBDA_DIR}" && zip -q "${ZIPFILE}" index.mjs)

if aws lambda get-function --function-name "${FUNCTION_NAME}" --region "${REGION}" > /dev/null 2>&1; then
  echo "    Updating function code..."
  aws lambda update-function-code \
    --function-name "${FUNCTION_NAME}" \
    --zip-file "fileb://${ZIPFILE}" \
    --region "${REGION}" \
    --query 'FunctionArn' --output text

  aws lambda wait function-updated --function-name "${FUNCTION_NAME}" --region "${REGION}"

  echo "    Updating function configuration..."
  aws lambda update-function-configuration \
    --function-name "${FUNCTION_NAME}" \
    --runtime nodejs22.x \
    --handler index.handler \
    --timeout 10 \
    --memory-size 128 \
    --environment "Variables={TABLE_NAME=${TABLE_NAME}}" \
    --region "${REGION}" \
    --query 'FunctionArn' --output text
else
  echo "    Creating function..."
  # Wait a bit more for role propagation if just created
  sleep 5
  aws lambda create-function \
    --function-name "${FUNCTION_NAME}" \
    --runtime nodejs22.x \
    --handler index.handler \
    --role "${ROLE_ARN}" \
    --zip-file "fileb://${ZIPFILE}" \
    --timeout 10 \
    --memory-size 128 \
    --environment "Variables={TABLE_NAME=${TABLE_NAME}}" \
    --region "${REGION}" \
    --query 'FunctionArn' --output text
fi

aws lambda wait function-active-v2 --function-name "${FUNCTION_NAME}" --region "${REGION}"
echo "    Function ready."

# ---- Function URL ----
echo ""
echo "==> Configuring Function URL"

CORS_CONFIG='{
  "AllowOrigins": ["https://forkzero.ai"],
  "AllowMethods": ["*"],
  "AllowHeaders": ["content-type"],
  "MaxAge": 86400
}'

# Clean up any existing Function URL (we use API Gateway instead)
aws lambda delete-function-url-config \
  --function-name "${FUNCTION_NAME}" \
  --region "${REGION}" 2>/dev/null || true
aws lambda remove-permission \
  --function-name "${FUNCTION_NAME}" \
  --statement-id public-invoke \
  --region "${REGION}" 2>/dev/null || true

# ---- API Gateway (HTTP API) ----
echo ""
echo "==> Configuring API Gateway"

API_NAME="forkzero-subscribe-api"

# Check if API already exists
API_ID=$(aws apigatewayv2 get-apis \
  --region "${REGION}" \
  --query "Items[?Name=='${API_NAME}'].ApiId | [0]" \
  --output text 2>/dev/null || true)

if [ -z "${API_ID}" ] || [ "${API_ID}" = "None" ]; then
  echo "    Creating HTTP API..."
  API_ID=$(aws apigatewayv2 create-api \
    --name "${API_NAME}" \
    --protocol-type HTTP \
    --cors-configuration '{
      "AllowOrigins": ["https://forkzero.ai"],
      "AllowMethods": ["POST", "OPTIONS"],
      "AllowHeaders": ["content-type"],
      "MaxAge": 86400
    }' \
    --region "${REGION}" \
    --query 'ApiId' --output text)
else
  echo "    API already exists (${API_ID}). Updating CORS..."
  aws apigatewayv2 update-api \
    --api-id "${API_ID}" \
    --cors-configuration '{
      "AllowOrigins": ["https://forkzero.ai"],
      "AllowMethods": ["POST", "OPTIONS"],
      "AllowHeaders": ["content-type"],
      "MaxAge": 86400
    }' \
    --region "${REGION}" > /dev/null
fi

# Create/update Lambda integration
INTEGRATION_ID=$(aws apigatewayv2 get-integrations \
  --api-id "${API_ID}" \
  --region "${REGION}" \
  --query 'Items[0].IntegrationId' --output text 2>/dev/null || true)

LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}"

if [ -z "${INTEGRATION_ID}" ] || [ "${INTEGRATION_ID}" = "None" ]; then
  echo "    Creating Lambda integration..."
  INTEGRATION_ID=$(aws apigatewayv2 create-integration \
    --api-id "${API_ID}" \
    --integration-type AWS_PROXY \
    --integration-uri "${LAMBDA_ARN}" \
    --payload-format-version 2.0 \
    --region "${REGION}" \
    --query 'IntegrationId' --output text)
fi

# Create/update route (POST /)
ROUTE_ID=$(aws apigatewayv2 get-routes \
  --api-id "${API_ID}" \
  --region "${REGION}" \
  --query "Items[?RouteKey=='POST /'].RouteId | [0]" --output text 2>/dev/null || true)

if [ -z "${ROUTE_ID}" ] || [ "${ROUTE_ID}" = "None" ]; then
  echo "    Creating POST / route..."
  aws apigatewayv2 create-route \
    --api-id "${API_ID}" \
    --route-key "POST /" \
    --target "integrations/${INTEGRATION_ID}" \
    --region "${REGION}" > /dev/null
fi

# Create/update $default stage with auto-deploy
STAGE_EXISTS=$(aws apigatewayv2 get-stages \
  --api-id "${API_ID}" \
  --region "${REGION}" \
  --query "Items[?StageName=='\$default'].StageName | [0]" --output text 2>/dev/null || true)

if [ -z "${STAGE_EXISTS}" ] || [ "${STAGE_EXISTS}" = "None" ]; then
  echo "    Creating default stage..."
  aws apigatewayv2 create-stage \
    --api-id "${API_ID}" \
    --stage-name '$default' \
    --auto-deploy \
    --region "${REGION}" > /dev/null
fi

# Set rate limiting: 10 requests/second sustained, 50 burst
echo "    Setting rate limits..."
aws apigatewayv2 update-stage \
  --api-id "${API_ID}" \
  --stage-name '$default' \
  --default-route-settings '{"ThrottlingBurstLimit":50,"ThrottlingRateLimit":10}' \
  --region "${REGION}" > /dev/null

# Grant API Gateway permission to invoke Lambda (idempotent: remove + add)
echo "    Setting API Gateway invoke permission..."
aws lambda remove-permission \
  --function-name "${FUNCTION_NAME}" \
  --statement-id apigateway-invoke \
  --region "${REGION}" 2>/dev/null || true
aws lambda add-permission \
  --function-name "${FUNCTION_NAME}" \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*" \
  --region "${REGION}" > /dev/null

API_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com"

echo ""
echo "==========================================================================="
echo "  Subscribe endpoint deployed."
echo ""
echo "  API URL: ${API_URL}"
echo "  DynamoDB table: ${TABLE_NAME}"
echo ""
echo "  Update src/constants.ts:"
echo "    export const SUBSCRIBE_API_URL = '${API_URL}'"
echo ""
echo "  Test:"
echo "    curl -X POST ${API_URL} \\"
echo "      -H 'Content-Type: application/json' \\"
echo "      -d '{\"email\":\"test@example.com\"}'"
echo "==========================================================================="
