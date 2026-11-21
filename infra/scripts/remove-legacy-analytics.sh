#!/usr/bin/env bash
set -euo pipefail

# ===========================================================================
# Remove the hand-made daily analytics resources that the CDK stack
# ForkzeroAi-Monitoring replaced (they were created by the old
# infra/setup-analytics.sh, now deleted).
#
# Run only after `make infra-deploy` and after the new daily email
# (forkzero-daily-report topic) has arrived. The script checks the stack is
# deployed and the new report subscription is confirmed before deleting.
# Idempotent: already-deleted resources are skipped.
#
# Removes:
#   EventBridge rule  forkzero-daily-analytics-5am
#   Lambda            forkzero-daily-analytics (+ its log group)
#   SNS topic         forkzero-daily-analytics (+ its email subscription)
#   IAM role          forkzero-analytics-lambda-role
#
# Kept (still used): Athena database/table, logs and results buckets.
#
# Usage: ./infra/scripts/remove-legacy-analytics.sh
# ===========================================================================

REGION="${AWS_DEFAULT_REGION:-us-east-1}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
STACK="ForkzeroAi-Monitoring"

# ---- Safety checks ----
STATUS=$(aws cloudformation describe-stacks --stack-name "${STACK}" --region "${REGION}" \
  --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "MISSING")
case "${STATUS}" in
  CREATE_COMPLETE | UPDATE_COMPLETE) ;;
  *)
    echo "Refusing: stack ${STACK} is ${STATUS}. Run make infra-deploy first." >&2
    exit 1
    ;;
esac

NEW_TOPIC_ARN="arn:aws:sns:${REGION}:${ACCOUNT_ID}:forkzero-daily-report"
CONFIRMED=$(aws sns list-subscriptions-by-topic --topic-arn "${NEW_TOPIC_ARN}" --region "${REGION}" \
  --query "length(Subscriptions[?Protocol=='email' && SubscriptionArn!='PendingConfirmation'])" --output text)
if [ "${CONFIRMED}" = "0" ]; then
  echo "Refusing: no confirmed email subscription on forkzero-daily-report yet." >&2
  echo "Confirm it from the inbox (and wait for the first new report) before removing the old one." >&2
  exit 1
fi

echo "Stack ${STACK} is ${STATUS}; new report subscription confirmed. Removing legacy resources..."

# ---- EventBridge rule ----
RULE="forkzero-daily-analytics-5am"
if aws events describe-rule --name "${RULE}" --region "${REGION}" > /dev/null 2>&1; then
  TARGET_IDS=$(aws events list-targets-by-rule --rule "${RULE}" --region "${REGION}" --query 'Targets[].Id' --output text)
  if [ -n "${TARGET_IDS}" ]; then
    # shellcheck disable=SC2086
    aws events remove-targets --rule "${RULE}" --ids ${TARGET_IDS} --region "${REGION}" > /dev/null
  fi
  aws events delete-rule --name "${RULE}" --region "${REGION}"
  echo "  deleted rule ${RULE}"
else
  echo "  rule ${RULE} already gone"
fi

# ---- Lambda + log group ----
FUNCTION="forkzero-daily-analytics"
if aws lambda get-function --function-name "${FUNCTION}" --region "${REGION}" > /dev/null 2>&1; then
  aws lambda delete-function --function-name "${FUNCTION}" --region "${REGION}"
  echo "  deleted Lambda ${FUNCTION}"
else
  echo "  Lambda ${FUNCTION} already gone"
fi
if aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/${FUNCTION}" --region "${REGION}" \
  --query "logGroups[?logGroupName=='/aws/lambda/${FUNCTION}'] | length(@)" --output text | grep -q '^1$'; then
  aws logs delete-log-group --log-group-name "/aws/lambda/${FUNCTION}" --region "${REGION}"
  echo "  deleted log group /aws/lambda/${FUNCTION}"
fi

# ---- SNS topic (deleting it removes its subscriptions) ----
OLD_TOPIC_ARN="arn:aws:sns:${REGION}:${ACCOUNT_ID}:forkzero-daily-analytics"
if aws sns get-topic-attributes --topic-arn "${OLD_TOPIC_ARN}" --region "${REGION}" > /dev/null 2>&1; then
  aws sns delete-topic --topic-arn "${OLD_TOPIC_ARN}" --region "${REGION}"
  echo "  deleted topic forkzero-daily-analytics"
else
  echo "  topic forkzero-daily-analytics already gone"
fi

# ---- IAM role ----
ROLE="forkzero-analytics-lambda-role"
if aws iam get-role --role-name "${ROLE}" > /dev/null 2>&1; then
  for arn in $(aws iam list-attached-role-policies --role-name "${ROLE}" --query 'AttachedPolicies[].PolicyArn' --output text); do
    aws iam detach-role-policy --role-name "${ROLE}" --policy-arn "${arn}"
  done
  for name in $(aws iam list-role-policies --role-name "${ROLE}" --query 'PolicyNames' --output text); do
    aws iam delete-role-policy --role-name "${ROLE}" --policy-name "${name}"
  done
  aws iam delete-role --role-name "${ROLE}"
  echo "  deleted role ${ROLE}"
else
  echo "  role ${ROLE} already gone"
fi

echo "Done."
