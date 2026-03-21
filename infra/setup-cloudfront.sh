#!/usr/bin/env bash
set -euo pipefail

# ===========================================================================
# CloudFront setup script for forkzero.ai
#
# Creates/updates and associates:
#   1. CloudFront Function for URL rewriting + trailing-slash redirects
#   2. Response Headers Policy (security headers)
#   3. Custom error responses (404 → /404.html, 403 → SPA fallback)
#
# Prerequisites:
#   - AWS CLI v2 configured with appropriate credentials
#   - jq installed
#
# Usage:
#   ./infra/setup-cloudfront.sh              # auto-detect distribution
#   DIST_ID=E1QZI... ./infra/setup-cloudfront.sh  # explicit distribution ID
# ===========================================================================

FUNCTION_NAME="forkzero-url-rewrite"
FUNCTION_FILE="$(dirname "$0")/cloudfront-url-rewrite.js"
HEADERS_POLICY_NAME="forkzero-security-headers"
DOMAIN="forkzero.ai"

# ---- Resolve distribution ID ----

if [ -z "${DIST_ID:-}" ]; then
  echo "==> Looking up CloudFront distribution for ${DOMAIN}..."
  DIST_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Aliases.Items[?@=='${DOMAIN}']].Id | [0]" \
    --output text)
  if [ -z "${DIST_ID}" ] || [ "${DIST_ID}" = "None" ]; then
    echo "ERROR: No CloudFront distribution found for ${DOMAIN}" >&2
    exit 1
  fi
fi
echo "    Distribution: ${DIST_ID}"

# ---- CloudFront Function: URL rewrite ----
echo ""
echo "==> Creating/updating CloudFront Function: ${FUNCTION_NAME}"

EXISTING=$(aws cloudfront list-functions \
  --query "FunctionList.Items[?Name=='${FUNCTION_NAME}'].Name" \
  --output text 2>/dev/null || true)

if [ -z "${EXISTING}" ]; then
  echo "    Creating new function..."
  aws cloudfront create-function \
    --name "${FUNCTION_NAME}" \
    --function-config '{"Comment":"Rewrite clean URLs to /index.html for S3 origin","Runtime":"cloudfront-js-2.0"}' \
    --function-code "fileb://${FUNCTION_FILE}"
else
  echo "    Updating existing function..."
  ETAG=$(aws cloudfront describe-function --name "${FUNCTION_NAME}" --query 'ETag' --output text)
  aws cloudfront update-function \
    --name "${FUNCTION_NAME}" \
    --if-match "${ETAG}" \
    --function-config '{"Comment":"Rewrite clean URLs to /index.html for S3 origin","Runtime":"cloudfront-js-2.0"}' \
    --function-code "fileb://${FUNCTION_FILE}"
fi

echo "    Publishing function..."
ETAG=$(aws cloudfront describe-function --name "${FUNCTION_NAME}" --query 'ETag' --output text)
aws cloudfront publish-function \
  --name "${FUNCTION_NAME}" \
  --if-match "${ETAG}"

FUNCTION_ARN=$(aws cloudfront describe-function --name "${FUNCTION_NAME}" \
  --query 'FunctionSummary.FunctionMetadata.FunctionARN' --output text)
echo "    Published: ${FUNCTION_ARN}"

# ---- Response Headers Policy: security headers ----
echo ""
echo "==> Creating/updating Response Headers Policy: ${HEADERS_POLICY_NAME}"

POLICY_CONFIG=$(cat <<'POLICY_JSON'
{
  "Name": "forkzero-security-headers",
  "Comment": "Security headers for forkzero.ai",
  "SecurityHeadersConfig": {
    "StrictTransportSecurity": {
      "Override": true,
      "AccessControlMaxAgeSec": 31536000,
      "IncludeSubdomains": true,
      "Preload": true
    },
    "FrameOptions": {
      "Override": true,
      "FrameOption": "DENY"
    },
    "ContentTypeOptions": {
      "Override": true
    },
    "ReferrerPolicy": {
      "Override": true,
      "ReferrerPolicy": "strict-origin-when-cross-origin"
    },
    "XSSProtection": {
      "Override": true,
      "Protection": true,
      "ModeBlock": true
    }
  },
  "CustomHeadersConfig": {
    "Quantity": 1,
    "Items": [
      {
        "Header": "Permissions-Policy",
        "Value": "geolocation=(), microphone=(), camera=()",
        "Override": true
      }
    ]
  }
}
POLICY_JSON
)

EXISTING_POLICY_ID=$(aws cloudfront list-response-headers-policies \
  --query "ResponseHeadersPolicyList.Items[?ResponseHeadersPolicy.ResponseHeadersPolicyConfig.Name=='${HEADERS_POLICY_NAME}'].ResponseHeadersPolicy.Id" \
  --output text 2>/dev/null || true)

if [ -z "${EXISTING_POLICY_ID}" ]; then
  echo "    Creating new policy..."
  RESULT=$(aws cloudfront create-response-headers-policy \
    --response-headers-policy-config "${POLICY_CONFIG}")
  POLICY_ID=$(echo "${RESULT}" | jq -r '.ResponseHeadersPolicy.Id')
else
  echo "    Updating existing policy..."
  POLICY_ID="${EXISTING_POLICY_ID}"
  ETAG=$(aws cloudfront get-response-headers-policy \
    --id "${POLICY_ID}" --query 'ETag' --output text)
  aws cloudfront update-response-headers-policy \
    --id "${POLICY_ID}" \
    --if-match "${ETAG}" \
    --response-headers-policy-config "${POLICY_CONFIG}"
fi

echo "    Policy ID: ${POLICY_ID}"

# ---- Associate everything with the distribution ----
echo ""
echo "==> Updating distribution ${DIST_ID}..."

# Fetch current config
TMPDIR=$(mktemp -d)
trap 'rm -rf "${TMPDIR}"' EXIT

aws cloudfront get-distribution-config --id "${DIST_ID}" > "${TMPDIR}/config.json"
DIST_ETAG=$(jq -r '.ETag' "${TMPDIR}/config.json")

# Build updated config with jq:
#   - Set function association on default cache behavior
#   - Set response headers policy on default cache behavior
#   - Set custom error responses (403 → SPA fallback, 404 → /404.html)
jq --arg fn_arn "${FUNCTION_ARN}" --arg policy_id "${POLICY_ID}" '
  .DistributionConfig
  | .DefaultCacheBehavior.FunctionAssociations = {
      "Quantity": 1,
      "Items": [{
        "FunctionARN": $fn_arn,
        "EventType": "viewer-request"
      }]
    }
  | .DefaultCacheBehavior.ResponseHeadersPolicyId = $policy_id
  | .CustomErrorResponses = {
      "Quantity": 2,
      "Items": [
        {
          "ErrorCode": 403,
          "ResponsePagePath": "/404.html",
          "ResponseCode": "404",
          "ErrorCachingMinTTL": 300
        },
        {
          "ErrorCode": 404,
          "ResponsePagePath": "/404.html",
          "ResponseCode": "404",
          "ErrorCachingMinTTL": 300
        }
      ]
    }
' "${TMPDIR}/config.json" > "${TMPDIR}/update.json"

aws cloudfront update-distribution \
  --id "${DIST_ID}" \
  --distribution-config "file://${TMPDIR}/update.json" \
  --if-match "${DIST_ETAG}" \
  --query 'Distribution.Status' \
  --output text

echo ""
echo "==> Done. Distribution is deploying — changes propagate in ~2-5 minutes."
echo "    Function:        ${FUNCTION_ARN}"
echo "    Headers Policy:  ${POLICY_ID}"
echo "    Error Responses: 403→/404.html (404), 404→/404.html (404)"
