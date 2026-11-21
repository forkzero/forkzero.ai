import * as cdk from 'aws-cdk-lib'
import * as iam from 'aws-cdk-lib/aws-iam'
import type { Construct } from 'constructs'
import { ALERTS_TOPIC_NAME } from './monitoring-stack.js'

export const GITHUB_REPO = 'forkzero/forkzero.ai'
/** GitHub environment the infra deploy jobs run in (requires reviewer approval). */
export const GITHUB_ENVIRONMENT = 'infra'
export const CI_ROLE_NAME = 'forkzero-ai-github-infra'
export const DIFF_ROLE_NAME = 'forkzero-ai-github-infra-diff'

/**
 * OIDC roles for .github/workflows/infra.yml.
 *
 * forkzero-ai-github-infra-diff (read-only): runs `cdk diff` on pushes to
 * main so the change is visible before anyone approves. It cannot assume the
 * CDK deploy roles; it reads the deployed templates directly.
 *
 * forkzero-ai-github-infra (deploy): runs `cdk deploy` for
 * ForkzeroAi-Monitoring.
 *
 * Security model: the role can only assume CDK's bootstrap roles, but the
 * bootstrap CloudFormation execution role has AdministratorAccess, so this
 * role is effectively admin through CloudFormation. It is therefore trusted
 * only for jobs running in this repo's `infra` GitHub environment, which
 * requires reviewer approval. This stack is deployed locally only
 * (make infra-deploy), never by the workflow, so CI cannot change its own
 * trust.
 */
export class CiBootstrapStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props)

    const { account, region } = this
    const provider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      'GitHubOidc',
      `arn:aws:iam::${account}:oidc-provider/token.actions.githubusercontent.com`,
    )

    const role = new iam.Role(this, 'GitHubInfraRole', {
      roleName: CI_ROLE_NAME,
      description: `GitHub Actions (${GITHUB_REPO}, environment ${GITHUB_ENVIRONMENT}) deploying the forkzero.ai CDK app`,
      maxSessionDuration: cdk.Duration.hours(1),
      assumedBy: new iam.FederatedPrincipal(
        provider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
            'token.actions.githubusercontent.com:sub': `repo:${GITHUB_REPO}:environment:${GITHUB_ENVIRONMENT}`,
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
    })

    // cdk diff/deploy work by assuming the bootstrap roles (qualifier hnb659fds)
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'AssumeCdkBootstrapRoles',
        actions: ['sts:AssumeRole'],
        resources: [
          `arn:aws:iam::${account}:role/cdk-hnb659fds-deploy-role-${account}-${region}`,
          `arn:aws:iam::${account}:role/cdk-hnb659fds-file-publishing-role-${account}-${region}`,
          `arn:aws:iam::${account}:role/cdk-hnb659fds-lookup-role-${account}-${region}`,
        ],
      }),
    )

    // The workflow looks up the forkzero.ai distribution ID, like the Makefile
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'FindDistribution',
        actions: ['cloudfront:ListDistributions'],
        resources: ['*'],
      }),
    )

    // Failed infra deploys alert the same topic as failed site deploys
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'PublishAlerts',
        actions: ['sns:Publish'],
        resources: [`arn:aws:sns:${region}:${account}:${ALERTS_TOPIC_NAME}`],
      }),
    )

    const diffRole = new iam.Role(this, 'GitHubInfraDiffRole', {
      roleName: DIFF_ROLE_NAME,
      description: `GitHub Actions (${GITHUB_REPO}, main branch) previewing forkzero.ai CDK changes (read-only)`,
      maxSessionDuration: cdk.Duration.hours(1),
      assumedBy: new iam.FederatedPrincipal(
        provider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
            'token.actions.githubusercontent.com:sub': `repo:${GITHUB_REPO}:ref:refs/heads/main`,
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
    })
    diffRole.addToPolicy(
      new iam.PolicyStatement({
        sid: 'ReadStacks',
        actions: ['cloudformation:DescribeStacks', 'cloudformation:GetTemplate', 'cloudformation:ListStackResources'],
        resources: [`arn:aws:cloudformation:${region}:${account}:stack/ForkzeroAi-*/*`],
      }),
    )
    diffRole.addToPolicy(
      new iam.PolicyStatement({
        sid: 'ReadBootstrapVersion',
        actions: ['ssm:GetParameter'],
        resources: [`arn:aws:ssm:${region}:${account}:parameter/cdk-bootstrap/hnb659fds/version`],
      }),
    )
    diffRole.addToPolicy(
      new iam.PolicyStatement({
        sid: 'FindDistribution',
        actions: ['cloudfront:ListDistributions'],
        resources: ['*'],
      }),
    )

    new cdk.CfnOutput(this, 'RoleArn', {
      value: role.roleArn,
      description: 'Set as the AWS_DEPLOY_ROLE_ARN repository variable',
    })
    new cdk.CfnOutput(this, 'DiffRoleArn', {
      value: diffRole.roleArn,
      description: 'Set as the AWS_DIFF_ROLE_ARN repository variable',
    })
  }
}
