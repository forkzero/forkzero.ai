#!/usr/bin/env node
/**
 * CDK app for forkzero.ai infrastructure. Deploy with `make infra-deploy`
 * (see docs/MONITORING.md), which supplies the values below.
 *
 * CloudFront, S3 hosting and the subscribe endpoint are still managed by the
 * scripts in infra/ (setup-cloudfront.sh etc.) until they move here.
 */
import { readFileSync } from 'node:fs'
import * as cdk from 'aws-cdk-lib'
import { MonitoringStack } from '../lib/monitoring-stack.js'

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    // Fail instead of synthesizing without a subscription: deploying without
    // an email would silently delete the existing one.
    throw new Error(`${name} is required (run via make infra-diff / make infra-deploy)`)
  }
  return value
}

function subscribeApiUrl(): string {
  const constants = readFileSync(new URL('../../src/constants.ts', import.meta.url), 'utf-8')
  const match = constants.match(/export const SUBSCRIBE_API_URL = '([^']+)'/)
  if (!match) throw new Error('SUBSCRIBE_API_URL not found in src/constants.ts')
  return match[1]
}

const app = new cdk.App()

new MonitoringStack(app, 'ForkzeroAi-Monitoring', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
  description: 'forkzero.ai daily analytics email and 5-minute health monitoring (infra/lib/monitoring-stack.ts)',
  reportEmail: required('REPORT_EMAIL'),
  alertEmail: process.env.ALERT_EMAIL || required('REPORT_EMAIL'),
  distributionId: required('DISTRIBUTION_ID'),
  subscribeApiUrl: subscribeApiUrl(),
  deployUserName: 'github-actions-deploy-forkzero-ai',
})
