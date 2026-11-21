import { describe, it, expect, beforeAll } from 'vitest'
import * as cdk from 'aws-cdk-lib'
import { Match, Template } from 'aws-cdk-lib/assertions'
import { CiBootstrapStack } from '../lib/ci-bootstrap-stack.js'

let template: Template

beforeAll(() => {
  const app = new cdk.App()
  const stack = new CiBootstrapStack(app, 'TestCi', { env: { account: '111111111111', region: 'us-east-1' } })
  template = Template.fromStack(stack)
})

type PolicyResource = {
  Properties: { Roles: Array<{ Ref: string }>; PolicyDocument: { Statement: Array<Record<string, unknown>> } }
}

function statementsFor(roleLogicalIdPrefix: string): Array<Record<string, unknown>> {
  return Object.values(template.findResources('AWS::IAM::Policy'))
    .map((p) => p as PolicyResource)
    .filter((p) => p.Properties.Roles.some((r) => r.Ref.startsWith(roleLogicalIdPrefix)))
    .flatMap((p) => p.Properties.PolicyDocument.Statement)
}

describe('CI bootstrap role', () => {
  it('deploy role trusts only the infra environment of this repo via GitHub OIDC', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'forkzero-ai-github-infra',
      MaxSessionDuration: 3600,
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRoleWithWebIdentity',
            Effect: 'Allow',
            Principal: {
              Federated: 'arn:aws:iam::111111111111:oidc-provider/token.actions.githubusercontent.com',
            },
            Condition: {
              StringEquals: {
                'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
                'token.actions.githubusercontent.com:sub': 'repo:forkzero/forkzero.ai:environment:infra',
              },
            },
          },
        ],
      },
    })
  })

  it('has no wildcard (StringLike) trust conditions on either role', () => {
    const roles = Object.values(template.findResources('AWS::IAM::Role')) as Array<{
      Properties: { AssumeRolePolicyDocument: { Statement: Array<{ Condition: Record<string, unknown> }> } }
    }>
    expect(roles).toHaveLength(2)
    for (const role of roles) {
      for (const statement of role.Properties.AssumeRolePolicyDocument.Statement) {
        expect(statement.Condition).not.toHaveProperty('StringLike')
      }
    }
  })

  it('deploy role may only assume the CDK bootstrap roles, list distributions and publish alerts', () => {
    const statements = statementsFor('GitHubInfraRole')
    expect(statements.map((s) => s.Sid).sort()).toEqual(['AssumeCdkBootstrapRoles', 'FindDistribution', 'PublishAlerts'])

    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Sid: 'AssumeCdkBootstrapRoles',
            Action: 'sts:AssumeRole',
            Resource: [
              'arn:aws:iam::111111111111:role/cdk-hnb659fds-deploy-role-111111111111-us-east-1',
              'arn:aws:iam::111111111111:role/cdk-hnb659fds-file-publishing-role-111111111111-us-east-1',
              'arn:aws:iam::111111111111:role/cdk-hnb659fds-lookup-role-111111111111-us-east-1',
            ],
          }),
          Match.objectLike({
            Sid: 'PublishAlerts',
            Action: 'sns:Publish',
            Resource: 'arn:aws:sns:us-east-1:111111111111:forkzero-alerts',
          }),
        ]),
      },
    })
  })

  it('diff role trusts only pushes to main and cannot assume the deploy roles', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'forkzero-ai-github-infra-diff',
      AssumeRolePolicyDocument: {
        Statement: [
          Match.objectLike({
            Condition: {
              StringEquals: {
                'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
                'token.actions.githubusercontent.com:sub': 'repo:forkzero/forkzero.ai:ref:refs/heads/main',
              },
            },
          }),
        ],
      },
    })
    const statements = statementsFor('GitHubInfraDiffRole')
    expect(statements.map((s) => s.Sid).sort()).toEqual(['FindDistribution', 'ReadBootstrapVersion', 'ReadStacks'])
    const actions = statements.flatMap((s) => [s.Action].flat() as string[])
    expect(actions.some((a) => a.startsWith('sts:'))).toBe(false)
    expect(actions.every((a) => /:(Describe|Get|List)/.test(a))).toBe(true)
  })

  it('outputs both role ARNs for the repository variables', () => {
    template.hasOutput('RoleArn', {})
    template.hasOutput('DiffRoleArn', {})
  })
})
