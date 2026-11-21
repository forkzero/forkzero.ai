# forkzero.ai infrastructure

CDK app (TypeScript) plus the remaining setup scripts.

| What | Managed by |
|---|---|
| Daily analytics email, 5-minute monitor, alarms, alerts topic | CDK stack `ForkzeroAi-Monitoring` (`lib/monitoring-stack.ts`) |
| OIDC roles for the infra workflow | CDK stack `ForkzeroAi-CiBootstrap` (`lib/ci-bootstrap-stack.ts`) |
| CloudFront distribution, URL function, security headers | `setup-cloudfront.sh` (moving to CDK later) |
| Subscribe endpoint | `setup-subscribe.sh`, `setup-subscribe-domain.sh` |

Lambda code for the report and monitor is in `analytics-report/`; the
monitoring runbook is `docs/MONITORING.md`.

## How changes ship

Push a change under `infra/` (or to `src/constants.ts`) to `main`, and
`.github/workflows/infra.yml` runs:

1. **Test and preview:** typecheck, unit tests, then `cdk diff` with a
   read-only role. The diff is in the run summary.
2. **Deploy:** only if the diff has changes, and only after you approve the
   pending deployment on the `infra` environment. A failed deploy emails
   `forkzero-alerts`.

The workflow deploys `ForkzeroAi-Monitoring` only. `ForkzeroAi-CiBootstrap`
holds the workflow's own roles, so it changes only through a local deploy.

Locally:

```bash
make infra-test                                  # typecheck + tests
make infra-diff   REPORT_EMAIL=you@example.com   # preview both stacks
make infra-deploy REPORT_EMAIL=you@example.com   # deploy both stacks
```

## Security model

CDK deploys through the bootstrap CloudFormation execution role, which has
`AdministratorAccess` (CDK's default). Anything that can run `cdk deploy` is
therefore effectively an account admin, so:

- the **deploy role** (`forkzero-ai-github-infra`) is trusted only for jobs
  in this repo's `infra` GitHub environment, which requires reviewer approval;
- the **diff role** (`forkzero-ai-github-infra-diff`) is trusted only for
  pushes to `main` and can only read `ForkzeroAi-*` stacks;
- neither role trusts pull requests or other branches, and both use exact
  `sub` matches (no wildcards).

## One-time setup

1. Deploy both stacks locally (creates the roles; prints their ARNs):

   ```bash
   make infra-deploy REPORT_EMAIL=you@example.com
   ```

2. Create the `infra` environment with yourself as required reviewer,
   deployable from `main` only (Settings → Environments → New environment →
   Required reviewers; Deployment branches: `main`), or:

   ```bash
   gh api -X PUT repos/forkzero/forkzero.ai/environments/infra \
     -F "reviewers[][type]=User" -F "reviewers[][id]=$(gh api user --jq .id)" \
     -F "deployment_branch_policy[protected_branches]=false" \
     -F "deployment_branch_policy[custom_branch_policies]=true"
   gh api -X POST repos/forkzero/forkzero.ai/environments/infra/deployment-branch-policies -f name=main
   ```

3. Set the role ARNs (from the `ForkzeroAi-CiBootstrap` outputs) and emails:

   ```bash
   gh variable set AWS_DEPLOY_ROLE_ARN --body "<RoleArn output>"
   gh variable set AWS_DIFF_ROLE_ARN   --body "<DiffRoleArn output>"
   gh secret set REPORT_EMAIL   # prompts for the value
   gh secret set ALERT_EMAIL    # optional; defaults to REPORT_EMAIL
   ```

4. Run the workflow once (Actions → Infrastructure → Run workflow) and check
   the diff reports no changes.
