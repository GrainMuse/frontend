# GitHub Actions setup

## CI

`ci.yml` runs on pull requests, pushes to `main`, and manual dispatch. It does
not use repository secrets. The frontend job audits production dependencies,
lints, tests, and builds the Vite application. Development-tool advisories are
handled by Dependabot because they do not ship in the production bundle. The
database job creates an isolated local Postgres
instance, replays the Supabase migrations, runs pgTAP/RLS tests, and lints the
schema.

Configure branch protection for `main` and require these checks:

- `Frontend`
- `Supabase database`

## Supabase deployment

`deploy-supabase-staging.yml` provides continuous delivery to staging. After the
`CI` workflow succeeds for a direct push to `main`, it checks out the exact
tested commit, applies pending migrations to the `staging` Supabase project,
and deploys the `submit-contact` Edge Function. Failed CI runs, pull request
runs, forks, and non-`main` branches cannot trigger a staging deployment.

`deploy-supabase.yml` remains the protected release path for production. It is
manual-only, accepts only `main`, and requires an explicit production
confirmation in addition to any GitHub Environment approval.

Create two GitHub environments named `staging` and `production`. Add these
environment secrets to each one using that environment's own Supabase project
values:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_ID`

Do not configure required reviewers on `staging`, because that would prevent
automatic delivery. Require reviewers for `production`. Keep staging and
production as separate Supabase projects. Edge Function runtime secrets such as
Turnstile, Resend, allowed origins, and the rate-limit salt must be configured
directly in each Supabase project before deploying the function; they are not
stored in GitHub or passed through these workflows.

Both workflows preview pending migrations before applying them and never use
`--include-seed`, `db reset`, or a service-role key. Production also requires
typing `DEPLOY_PRODUCTION` when dispatching the workflow.
