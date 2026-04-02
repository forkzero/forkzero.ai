#!/usr/bin/env bash
set -euo pipefail

# ===========================================================================
# Custom domain setup for the subscribe API: app.forkzero.ai
#
# Creates/updates:
#   1. ACM certificate for app.forkzero.ai (with DNS validation)
#   2. API Gateway custom domain mapping
#   3. Route 53 DNS record pointing to the API Gateway domain
#   4. Updates API route from POST / to POST /api/subscribe
#
# Prerequisites:
#   - AWS CLI v2 configured with appropriate credentials
#   - jq installed
#   - setup-subscribe.sh already run (API Gateway + Lambda exist)
#
# Usage:
#   ./infra/setup-subscribe-domain.sh
#
# Note: ACM DNS validation may take a few minutes on first run.
#       Re-run the script if it times out — it is idempotent.
# ===========================================================================

REGION="${AWS_DEFAULT_REGION:-us-east-1}"
DOMAIN="app.forkzero.ai"
API_NAME="forkzero-subscribe-api"
HOSTED_ZONE_NAME="forkzero.ai."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "==> Region: ${REGION} | Account: ${ACCOUNT_ID}"

# ---- Find existing API Gateway ----
echo ""
echo "==> Looking up API Gateway: ${API_NAME}"

API_ID=$(aws apigatewayv2 get-apis \
  --region "${REGION}" \
  --query "Items[?Name=='${API_NAME}'].ApiId | [0]" \
  --output text 2>/dev/null || true)

if [ -z "${API_ID}" ] || [ "${API_ID}" = "None" ]; then
  echo "    ERROR: API Gateway '${API_NAME}' not found. Run setup-subscribe.sh first." >&2
  exit 1
fi
echo "    API ID: ${API_ID}"

# ---- Update route to POST /api/subscribe ----
echo ""
echo "==> Configuring API route"

# Remove old POST / route if it exists
OLD_ROUTE_ID=$(aws apigatewayv2 get-routes \
  --api-id "${API_ID}" \
  --region "${REGION}" \
  --query "Items[?RouteKey=='POST /'].RouteId | [0]" --output text 2>/dev/null || true)

if [ -n "${OLD_ROUTE_ID}" ] && [ "${OLD_ROUTE_ID}" != "None" ]; then
  echo "    Removing old POST / route..."
  aws apigatewayv2 delete-route \
    --api-id "${API_ID}" \
    --route-id "${OLD_ROUTE_ID}" \
    --region "${REGION}"
fi

# Get integration ID
INTEGRATION_ID=$(aws apigatewayv2 get-integrations \
  --api-id "${API_ID}" \
  --region "${REGION}" \
  --query 'Items[0].IntegrationId' --output text)

# Create POST /api/subscribe route if missing
ROUTE_ID=$(aws apigatewayv2 get-routes \
  --api-id "${API_ID}" \
  --region "${REGION}" \
  --query "Items[?RouteKey=='POST /api/subscribe'].RouteId | [0]" --output text 2>/dev/null || true)

if [ -z "${ROUTE_ID}" ] || [ "${ROUTE_ID}" = "None" ]; then
  echo "    Creating POST /api/subscribe route..."
  aws apigatewayv2 create-route \
    --api-id "${API_ID}" \
    --route-key "POST /api/subscribe" \
    --target "integrations/${INTEGRATION_ID}" \
    --region "${REGION}" > /dev/null
else
  echo "    Route POST /api/subscribe already exists."
fi

# ---- ACM Certificate ----
echo ""
echo "==> Configuring ACM certificate for ${DOMAIN}"

CERT_ARN=$(aws acm list-certificates \
  --region "${REGION}" \
  --query "CertificateSummaryList[?DomainName=='${DOMAIN}'].CertificateArn | [0]" \
  --output text 2>/dev/null || true)

if [ -z "${CERT_ARN}" ] || [ "${CERT_ARN}" = "None" ]; then
  echo "    Requesting certificate..."
  CERT_ARN=$(aws acm request-certificate \
    --domain-name "${DOMAIN}" \
    --validation-method DNS \
    --region "${REGION}" \
    --query 'CertificateArn' --output text)
  echo "    Certificate requested: ${CERT_ARN}"
  echo "    Waiting for DNS validation record..."
  sleep 5
else
  echo "    Certificate exists: ${CERT_ARN}"
fi

# ---- DNS validation ----
echo ""
echo "==> Setting up DNS validation"

HOSTED_ZONE_ID=$(aws route53 list-hosted-zones \
  --query "HostedZones[?Name=='${HOSTED_ZONE_NAME}'].Id | [0]" \
  --output text | sed 's|/hostedzone/||')

if [ -z "${HOSTED_ZONE_ID}" ] || [ "${HOSTED_ZONE_ID}" = "None" ]; then
  echo "    ERROR: Hosted zone for ${HOSTED_ZONE_NAME} not found." >&2
  exit 1
fi

# Get validation CNAME
VALIDATION_NAME=$(aws acm describe-certificate \
  --certificate-arn "${CERT_ARN}" \
  --region "${REGION}" \
  --query 'Certificate.DomainValidationOptions[0].ResourceRecord.Name' --output text)

VALIDATION_VALUE=$(aws acm describe-certificate \
  --certificate-arn "${CERT_ARN}" \
  --region "${REGION}" \
  --query 'Certificate.DomainValidationOptions[0].ResourceRecord.Value' --output text)

if [ -n "${VALIDATION_NAME}" ] && [ "${VALIDATION_NAME}" != "None" ]; then
  echo "    Upserting validation CNAME: ${VALIDATION_NAME}"
  aws route53 change-resource-record-sets \
    --hosted-zone-id "${HOSTED_ZONE_ID}" \
    --change-batch "{
      \"Changes\": [{
        \"Action\": \"UPSERT\",
        \"ResourceRecordSet\": {
          \"Name\": \"${VALIDATION_NAME}\",
          \"Type\": \"CNAME\",
          \"TTL\": 300,
          \"ResourceRecords\": [{\"Value\": \"${VALIDATION_VALUE}\"}]
        }
      }]
    }" > /dev/null
fi

# Wait for certificate to be issued
CERT_STATUS=$(aws acm describe-certificate \
  --certificate-arn "${CERT_ARN}" \
  --region "${REGION}" \
  --query 'Certificate.Status' --output text)

if [ "${CERT_STATUS}" != "ISSUED" ]; then
  echo "    Waiting for certificate validation (this may take 1-5 minutes)..."
  aws acm wait certificate-validated \
    --certificate-arn "${CERT_ARN}" \
    --region "${REGION}"
fi
echo "    Certificate issued."

# ---- API Gateway Custom Domain ----
echo ""
echo "==> Configuring custom domain: ${DOMAIN}"

EXISTING_DOMAIN=$(aws apigatewayv2 get-domain-names \
  --region "${REGION}" \
  --query "Items[?DomainName=='${DOMAIN}'].DomainName | [0]" \
  --output text 2>/dev/null || true)

if [ -z "${EXISTING_DOMAIN}" ] || [ "${EXISTING_DOMAIN}" = "None" ]; then
  echo "    Creating custom domain..."
  aws apigatewayv2 create-domain-name \
    --domain-name "${DOMAIN}" \
    --domain-name-configurations "CertificateArn=${CERT_ARN}" \
    --region "${REGION}" > /dev/null
else
  echo "    Custom domain already exists."
fi

# Get the target domain name for DNS
TARGET_DOMAIN=$(aws apigatewayv2 get-domain-name \
  --domain-name "${DOMAIN}" \
  --region "${REGION}" \
  --query 'DomainNameConfigurations[0].ApiGatewayDomainName' --output text)

echo "    Target: ${TARGET_DOMAIN}"

# Create/update API mapping
MAPPING_ID=$(aws apigatewayv2 get-api-mappings \
  --domain-name "${DOMAIN}" \
  --region "${REGION}" \
  --query "Items[?ApiId=='${API_ID}'].ApiMappingId | [0]" \
  --output text 2>/dev/null || true)

if [ -z "${MAPPING_ID}" ] || [ "${MAPPING_ID}" = "None" ]; then
  echo "    Creating API mapping..."
  aws apigatewayv2 create-api-mapping \
    --domain-name "${DOMAIN}" \
    --api-id "${API_ID}" \
    --stage '$default' \
    --region "${REGION}" > /dev/null
else
  echo "    API mapping already exists."
fi

# ---- Route 53 DNS record ----
echo ""
echo "==> Creating DNS record: ${DOMAIN} -> ${TARGET_DOMAIN}"

aws route53 change-resource-record-sets \
  --hosted-zone-id "${HOSTED_ZONE_ID}" \
  --change-batch "{
    \"Changes\": [{
      \"Action\": \"UPSERT\",
      \"ResourceRecordSet\": {
        \"Name\": \"${DOMAIN}\",
        \"Type\": \"CNAME\",
        \"TTL\": 300,
        \"ResourceRecords\": [{\"Value\": \"${TARGET_DOMAIN}\"}]
      }
    }]
  }" > /dev/null

echo "    DNS record set."

# ---- Done ----
echo ""
echo "==========================================================================="
echo "  Custom domain configured: https://${DOMAIN}/api/subscribe"
echo ""
echo "  DNS may take a few minutes to propagate."
echo ""
echo "  Update src/constants.ts:"
echo "    export const SUBSCRIBE_API_URL = 'https://${DOMAIN}/api/subscribe'"
echo ""
echo "  Test:"
echo "    curl -X POST https://${DOMAIN}/api/subscribe \\"
echo "      -H 'Content-Type: application/json' \\"
echo "      -d '{\"email\":\"test@example.com\"}'"
echo "==========================================================================="
