/**
 * Email subscribe endpoint for forkzero.ai
 *
 * Accepts POST { email } and stores in DynamoDB.
 * Invoked via API Gateway HTTP API.
 *
 * Security:
 *   - Origin header check rejects requests not from forkzero.ai
 *   - Rate limited at API Gateway (50 burst, 10 req/s sustained)
 *   - Request body size capped at 1 KB
 *   - Email validated: format, length, character allowlist
 *   - Honeypot field rejects bots that fill hidden inputs
 *   - Conditional put prevents overwrites
 *   - CORS restricted to forkzero.ai
 *
 * Environment variables:
 *   TABLE_NAME — DynamoDB table name (default: forkzero-subscribers)
 */

import { DynamoDBClient, PutItemCommand, ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'

const db = new DynamoDBClient()
const TABLE = process.env.TABLE_NAME || 'forkzero-subscribers'

const MAX_BODY_BYTES = 1024
const MAX_EMAIL_LENGTH = 254 // RFC 5321
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
const ALLOWED_ORIGINS = ['https://forkzero.ai', 'https://www.forkzero.ai']

const CORS_HEADERS = {
  'access-control-allow-origin': 'https://forkzero.ai',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'content-type': 'application/json',
}

function response(statusCode, body) {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) }
}

export async function handler(event) {
  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return response(204, '')
  }

  // Only accept POST
  if (event.requestContext?.http?.method !== 'POST') {
    return response(405, { error: 'Method not allowed' })
  }

  // Reject requests without a valid Origin header
  // Browsers always send Origin on cross-origin POST; scripts typically don't
  const origin = event.headers?.origin || event.headers?.Origin || ''
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return response(403, { error: 'Forbidden' })
  }

  // Check body size before parsing
  const rawBody = event.body || ''
  if (rawBody.length > MAX_BODY_BYTES) {
    return response(413, { error: 'Request too large' })
  }

  // Parse body
  let body
  try {
    body = JSON.parse(rawBody)
  } catch {
    return response(400, { error: 'Invalid JSON' })
  }

  // Honeypot: if "website" field is filled, it's a bot
  // The form has a hidden field named "website" that humans never see
  if (body.website) {
    // Return success to not tip off the bot, but don't store
    return response(200, { ok: true })
  }

  const email = (body.email || '').trim().toLowerCase()

  // Validate email
  if (!email) {
    return response(400, { error: 'Email required' })
  }
  if (email.length > MAX_EMAIL_LENGTH) {
    return response(400, { error: 'Email too long' })
  }
  if (!EMAIL_REGEX.test(email)) {
    return response(400, { error: 'Valid email required' })
  }

  // Store in DynamoDB (conditional put — skip if already exists)
  try {
    await db.send(
      new PutItemCommand({
        TableName: TABLE,
        Item: {
          email: { S: email },
          subscribed_at: { S: new Date().toISOString() },
          source: { S: 'website' },
        },
        ConditionExpression: 'attribute_not_exists(email)',
      })
    )
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      // Already subscribed — return success silently
      return response(200, { ok: true })
    }
    console.error('DynamoDB error:', err)
    return response(500, { error: 'Internal error' })
  }

  return response(200, { ok: true })
}
