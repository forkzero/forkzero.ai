import { fileURLToPath } from 'node:url'
import * as cdk from 'aws-cdk-lib'
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch'
import * as cwActions from 'aws-cdk-lib/aws-cloudwatch-actions'
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as sns from 'aws-cdk-lib/aws-sns'
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions'
import type { Construct } from 'constructs'

/** infra/ — the Lambda asset root, so analytics-report/ can read ../cloudfront-*.json|js */
const INFRA_DIR = fileURLToPath(new URL('..', import.meta.url))

export const ALERTS_TOPIC_NAME = 'forkzero-alerts'
export const METRIC_NAMESPACE = 'Forkzero/Monitor'

export interface MonitoringStackProps extends cdk.StackProps {
  /** Email for the daily analytics report. */
  reportEmail: string
  /** Email for alerts (alarms, failed deploys, failed CI on main). */
  alertEmail: string
  /** CloudFront distribution serving forkzero.ai (drift checks read its config). */
  distributionId: string
  /** Subscribe endpoint, from src/constants.ts. */
  subscribeApiUrl: string
  /** IAM user GitHub Actions deploys with; allowed to publish alerts. */
  deployUserName: string
}

/**
 * Daily analytics email and 5-minute health monitoring for forkzero.ai.
 * Lambda code lives in infra/analytics-report/; runbook in docs/MONITORING.md.
 */
export class MonitoringStack extends cdk.Stack {
  readonly alertsTopic: sns.Topic
  readonly reportTopic: sns.Topic

  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props)

    const { account, region } = this

    // ---- Topics ----
    this.reportTopic = new sns.Topic(this, 'ReportTopic', {
      topicName: 'forkzero-daily-report',
      displayName: 'forkzero.ai daily report',
    })
    this.reportTopic.addSubscription(new subs.EmailSubscription(props.reportEmail))

    this.alertsTopic = new sns.Topic(this, 'AlertsTopic', {
      topicName: ALERTS_TOPIC_NAME,
      displayName: 'forkzero.ai alerts',
    })
    this.alertsTopic.addSubscription(new subs.EmailSubscription(props.alertEmail))

    // ---- Shared Lambda package (keeps the infra/ layout) ----
    const code = lambda.Code.fromAsset(INFRA_DIR, {
      exclude: [
        '**',
        '.*', // '**' does not match dotfiles
        '**/.*',
        '!analytics-report',
        '!analytics-report/*.mjs',
        'analytics-report/*.test.mjs',
        '!cloudfront-url-rewrite.js',
        '!cloudfront-site-paths.json',
      ],
    })

    const environment = {
      DISTRIBUTION_ID: props.distributionId,
      SUBSCRIBE_API_URL: props.subscribeApiUrl,
    }

    const makeFunction = (
      id: string,
      functionName: string,
      handler: string,
      timeout: cdk.Duration,
      extraEnv: Record<string, string> = {},
    ) =>
      new lambda.Function(this, id, {
        functionName,
        runtime: lambda.Runtime.NODEJS_22_X,
        architecture: lambda.Architecture.ARM_64,
        code,
        handler,
        timeout,
        memorySize: 256,
        environment: { ...environment, ...extraEnv },
        logGroup: new logs.LogGroup(this, `${id}Logs`, {
          logGroupName: `/aws/lambda/${functionName}`,
          retention: logs.RetentionDays.ONE_MONTH,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
      })

    const dailyReport = makeFunction('DailyReport', 'forkzero-daily-report', 'analytics-report/index.handler', cdk.Duration.minutes(2), {
      SNS_TOPIC_ARN: this.reportTopic.topicArn,
      ATHENA_DATABASE: 'forkzero',
      ATHENA_OUTPUT: 's3://forkzero-athena-results/',
    })
    const monitor = makeFunction('Monitor', 'forkzero-monitor', 'analytics-report/monitor.handler', cdk.Duration.minutes(1))

    // ---- Permissions ----
    // Both run the health checks: read CloudFront config, publish metrics.
    for (const fn of [dailyReport, monitor]) {
      fn.addToRolePolicy(
        new iam.PolicyStatement({
          sid: 'CloudFrontDriftRead',
          actions: ['cloudfront:GetFunction', 'cloudfront:GetDistributionConfig'],
          resources: [
            `arn:aws:cloudfront::${account}:function/forkzero-url-rewrite`,
            `arn:aws:cloudfront::${account}:distribution/${props.distributionId}`,
          ],
        }),
      )
    }
    monitor.addToRolePolicy(
      new iam.PolicyStatement({
        sid: 'MonitorMetrics',
        actions: ['cloudwatch:PutMetricData'],
        resources: ['*'],
        conditions: { StringEquals: { 'cloudwatch:namespace': METRIC_NAMESPACE } },
      }),
    )

    // Daily report: Athena over the CloudFront logs, then email.
    this.reportTopic.grantPublish(dailyReport)
    dailyReport.addToRolePolicy(
      new iam.PolicyStatement({
        sid: 'Athena',
        actions: ['athena:StartQueryExecution', 'athena:GetQueryExecution', 'athena:GetQueryResults'],
        resources: [`arn:aws:athena:${region}:${account}:workgroup/primary`],
      }),
    )
    dailyReport.addToRolePolicy(
      new iam.PolicyStatement({
        sid: 'GlueCatalog',
        actions: ['glue:GetDatabase', 'glue:GetTable', 'glue:GetPartition', 'glue:GetPartitions'],
        resources: [
          `arn:aws:glue:${region}:${account}:catalog`,
          `arn:aws:glue:${region}:${account}:database/forkzero`,
          `arn:aws:glue:${region}:${account}:table/forkzero/cloudfront_logs`,
        ],
      }),
    )
    dailyReport.addToRolePolicy(
      new iam.PolicyStatement({
        sid: 'ReadLogs',
        actions: ['s3:GetObject', 's3:ListBucket', 's3:GetBucketLocation'],
        resources: ['arn:aws:s3:::forkzero-web-prod-logs', 'arn:aws:s3:::forkzero-web-prod-logs/*'],
      }),
    )
    dailyReport.addToRolePolicy(
      new iam.PolicyStatement({
        sid: 'AthenaResults',
        actions: ['s3:GetObject', 's3:PutObject', 's3:ListBucket', 's3:GetBucketLocation', 's3:AbortMultipartUpload'],
        resources: ['arn:aws:s3:::forkzero-athena-results', 'arn:aws:s3:::forkzero-athena-results/*'],
      }),
    )

    // ---- Schedules ----
    new events.Rule(this, 'DailyReportSchedule', {
      description: 'Daily analytics report at 10:00 UTC',
      schedule: events.Schedule.cron({ hour: '10', minute: '0' }),
      targets: [new targets.LambdaFunction(dailyReport, { retryAttempts: 2 })],
    })
    new events.Rule(this, 'MonitorSchedule', {
      description: 'forkzero.ai health checks every 5 minutes',
      schedule: events.Schedule.rate(cdk.Duration.minutes(5)),
      targets: [new targets.LambdaFunction(monitor, { retryAttempts: 0 })],
    })

    // ---- Alarms -> alerts topic (alarm and recovery) ----
    const notify = new cwActions.SnsAction(this.alertsTopic)
    const alarm = (id: string, props: cloudwatch.AlarmProps) => {
      const a = new cloudwatch.Alarm(this, id, props)
      a.addAlarmAction(notify)
      a.addOkAction(notify)
      return a
    }

    alarm('ChecksFailing', {
      alarmName: 'forkzero-health-checks-failing',
      alarmDescription:
        'forkzero.ai health checks failing. Details: aws logs tail /aws/lambda/forkzero-monitor --since 30m (runbook: docs/MONITORING.md)',
      metric: new cloudwatch.Metric({
        namespace: METRIC_NAMESPACE,
        metricName: 'FailingChecks',
        statistic: 'Maximum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      evaluationPeriods: 3,
      datapointsToAlarm: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    })

    alarm('MonitorNotRunning', {
      alarmName: 'forkzero-monitor-not-running',
      alarmDescription:
        'The forkzero.ai monitor has not reported for 15 minutes. Check: aws logs tail /aws/lambda/forkzero-monitor --since 1h',
      metric: new cloudwatch.Metric({
        namespace: METRIC_NAMESPACE,
        metricName: 'ChecksRun',
        statistic: 'Sum',
        period: cdk.Duration.minutes(15),
      }),
      threshold: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING,
    })

    // A failed daily report sends no email at all, so alert on it.
    alarm('DailyReportFailed', {
      alarmName: 'forkzero-daily-report-failed',
      alarmDescription: 'The daily analytics report Lambda errored. Check: aws logs tail /aws/lambda/forkzero-daily-report --since 1d',
      metric: dailyReport.metricErrors({ period: cdk.Duration.hours(1), statistic: 'Sum' }),
      threshold: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    })

    // ---- GitHub Actions may publish deploy / CI failure alerts ----
    new iam.Policy(this, 'DeployUserAlertsPublish', {
      policyName: 'forkzero-ai-alerts-publish',
      users: [iam.User.fromUserName(this, 'DeployUser', props.deployUserName)],
      statements: [
        new iam.PolicyStatement({ actions: ['sns:Publish'], resources: [this.alertsTopic.topicArn] }),
      ],
    })

    new cdk.CfnOutput(this, 'AlertsTopicArn', { value: this.alertsTopic.topicArn })
    new cdk.CfnOutput(this, 'ReportTopicArn', { value: this.reportTopic.topicArn })
  }
}
