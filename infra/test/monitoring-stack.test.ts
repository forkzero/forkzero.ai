import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, it, expect, beforeAll } from 'vitest'
import * as cdk from 'aws-cdk-lib'
import { Match, Template } from 'aws-cdk-lib/assertions'
import { MonitoringStack } from '../lib/monitoring-stack.js'

let app: cdk.App
let template: Template

beforeAll(() => {
  app = new cdk.App()
  const stack = new MonitoringStack(app, 'Test', {
    env: { account: '111111111111', region: 'us-east-1' },
    reportEmail: 'report@example.com',
    alertEmail: 'alerts@example.com',
    distributionId: 'EDISTRIBUTION',
    subscribeApiUrl: 'https://api.example.com',
    deployUserName: 'deploy-user',
  })
  template = Template.fromStack(stack)
})

const alertsTopic = { Ref: Match.stringLikeRegexp('^AlertsTopic') }

describe('topics', () => {
  it('creates the report and alerts topics with email subscriptions', () => {
    template.hasResourceProperties('AWS::SNS::Topic', { TopicName: 'forkzero-daily-report' })
    template.hasResourceProperties('AWS::SNS::Topic', { TopicName: 'forkzero-alerts' })
    template.hasResourceProperties('AWS::SNS::Subscription', { Protocol: 'email', Endpoint: 'report@example.com' })
    template.hasResourceProperties('AWS::SNS::Subscription', {
      Protocol: 'email',
      Endpoint: 'alerts@example.com',
      TopicArn: alertsTopic,
    })
  })
})

describe('functions', () => {
  it('deploys the daily report and monitor from the shared package', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'forkzero-daily-report',
      Handler: 'analytics-report/index.handler',
      Runtime: 'nodejs22.x',
      Environment: {
        Variables: Match.objectLike({ DISTRIBUTION_ID: 'EDISTRIBUTION', ATHENA_DATABASE: 'forkzero' }),
      },
    })
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'forkzero-monitor',
      Handler: 'analytics-report/monitor.handler',
      Runtime: 'nodejs22.x',
      Environment: {
        Variables: Match.objectLike({ SUBSCRIBE_API_URL: 'https://api.example.com' }),
      },
    })
  })

  it('packages only the Lambda code and the CloudFront files the drift check reads', () => {
    const assembly = app.synth()
    const assetDirs = readdirSync(assembly.directory).filter((d) => d.startsWith('asset.'))
    expect(assetDirs).toHaveLength(1)
    const root = join(assembly.directory, assetDirs[0])
    const files: string[] = []
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name)
        if (statSync(path).isDirectory()) walk(path)
        else files.push(relative(root, path))
      }
    }
    walk(root)
    expect(files.sort()).toEqual([
      'analytics-report/checks.mjs',
      'analytics-report/index.mjs',
      'analytics-report/monitor.mjs',
      'cloudfront-site-paths.json',
      'cloudfront-url-rewrite.js',
    ])
  })

  it('keeps logs for a month', () => {
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      LogGroupName: '/aws/lambda/forkzero-monitor',
      RetentionInDays: 30,
    })
  })
})

describe('schedules', () => {
  it('runs the report daily at 10:00 UTC and the monitor every 5 minutes', () => {
    template.hasResourceProperties('AWS::Events::Rule', { ScheduleExpression: 'cron(0 10 * * ? *)' })
    template.hasResourceProperties('AWS::Events::Rule', { ScheduleExpression: 'rate(5 minutes)' })
  })
})

describe('alarms', () => {
  it.each([
    ['forkzero-health-checks-failing', 'FailingChecks'],
    ['forkzero-monitor-not-running', 'ChecksRun'],
    ['forkzero-daily-report-failed', 'Errors'],
  ])('%s alerts on failure and recovery', (alarmName, metricName) => {
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: alarmName,
      MetricName: metricName,
      AlarmActions: [alertsTopic],
      OKActions: [alertsTopic],
    })
  })

  it('treats a silent monitor as broken', () => {
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'forkzero-monitor-not-running',
      TreatMissingData: 'breaching',
    })
  })
})

describe('permissions', () => {
  it('lets the monitor publish metrics only in its namespace', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: 'cloudwatch:PutMetricData',
            Condition: { StringEquals: { 'cloudwatch:namespace': 'Forkzero/Monitor' } },
          }),
        ]),
      },
    })
  })

  it('scopes CloudFront reads to the URL function and the distribution', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: ['cloudfront:GetFunction', 'cloudfront:GetDistributionConfig'],
            Resource: [
              'arn:aws:cloudfront::111111111111:function/forkzero-url-rewrite',
              'arn:aws:cloudfront::111111111111:distribution/EDISTRIBUTION',
            ],
          }),
        ]),
      },
    })
  })

  it('lets the GitHub Actions deploy user publish alerts', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyName: 'forkzero-ai-alerts-publish',
      Users: ['deploy-user'],
      PolicyDocument: {
        Statement: [Match.objectLike({ Action: 'sns:Publish', Resource: alertsTopic })],
      },
    })
  })
})
