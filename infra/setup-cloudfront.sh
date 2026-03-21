#!/usr/bin/env bash
set -euo pipefail

# ===========================================================================
# One-time CloudFront setup script for forkzero.ai
# Creates/updates: URL rewrite function + security response headers policy
#
# Prerequisites:
#   - AWS CLI v2 configured with appropriate credentials
#   - jq installed
#
# Usage:
#   chmod +x infra/setup-cloudfront.sh
#   ./infra/setup-cloudfront.sh
#
# After running, manually associate the function and headers policy with
# your CloudFront distribution's default cache behavior.
# ===========================================================================

FUNCTION_NAME="forkzero-url-rewrite"
FUNCTION_FILE="$(dirname "$0")/cloudfront-url-rewrite.js"
HEADERS_POLICY_NAME="forkzero-security-headers"

# ---- CloudFront Function: URL rewrite ----
echo "==> Creating/updating CloudFront Function: ${FUNCTION_NAME}"

# Check if the function already exists
EXISTING=$(aws cloudfront list-functions --query "FunctionList.Items[?Name=='${FUNCTION_NAME}'].Name" --output text 2>/dev/null || true)

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

FUNCTION_ARN=$(aws cloudfront describe-function --name "${FUNCTION_NAME}" --query 'FunctionSummary.FunctionMetadata.FunctionARN' --output text)
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

# Check if the policy already exists
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

# ---- Custom Error Response: proper 404 page ----
echo ""
echo "==> Configuring custom error response for 404s"
echo ""
echo "NOTE: CloudFront custom error responses must be set via the distribution"
echo "config (not a standalone resource). Run the following to update it:"
echo ""
echo "  DIST_ID=your-distribution-id"
echo ""
echo '  # Get current config'
echo '  aws cloudfront get-distribution-config --id $DIST_ID > /tmp/cf-config.json'
echo '  ETAG=$(jq -r .ETag /tmp/cf-config.json)'
echo ""
echo '  # Extract DistributionConfig and add custom error response'
echo '  jq ".DistributionConfig.CustomErrorResponses = {'
echo '    \"Quantity\": 1,'
echo '    \"Items\": [{'
echo '      \"ErrorCode\": 404,'
echo '      \"ResponsePagePath\": \"/404.html\",'
echo '      \"ResponseCode\": \"404\",'
echo '      \"ErrorCachingMinTTL\": 300'
echo '    }]'
echo '  } | .DistributionConfig" /tmp/cf-config.json > /tmp/cf-update.json'
echo ""
echo '  aws cloudfront update-distribution \'
echo '    --id $DIST_ID \'
echo '    --distribution-config file:///tmp/cf-update.json \'
echo '    --if-match $ETAG'

# ---- Instructions ----
echo ""
echo "==========================================================================="
echo "NEXT STEPS — Associate with your CloudFront distribution:"
echo ""
echo "1. Open the CloudFront console → Distributions → your distribution"
echo "2. Edit the Default Cache Behavior:"
echo "   a. Function associations → Viewer request → CloudFront Functions"
echo "      → Select '${FUNCTION_NAME}'"
echo "   b. Response headers policy → Select '${HEADERS_POLICY_NAME}'"
echo "3. Configure Custom Error Response (Error Pages tab):"
echo "   a. Error code: 404"
echo "   b. Customize error response: Yes"
echo "   c. Response page path: /404.html"
echo "   d. HTTP response code: 404"
echo "   e. Error caching minimum TTL: 300"
echo "4. Save and wait for deployment to complete"
echo ""
echo "Or via CLI (replace DIST_ID):"
echo "  aws cloudfront get-distribution-config --id DIST_ID > dist-config.json"
echo "  # Edit DefaultCacheBehavior to add:"
echo "  #   FunctionAssociations with ${FUNCTION_ARN}"
echo "  #   ResponseHeadersPolicyId: ${POLICY_ID}"
echo "  # Edit CustomErrorResponses to add 404 → /404.html mapping"
echo "  aws cloudfront update-distribution --id DIST_ID --distribution-config file://dist-config.json --if-match ETAG"
echo "==========================================================================="
