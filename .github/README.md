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

`deploy-supabase.yml` is manual-only and only accepts `main`. Create two GitHub
environments named `staging` and `production`. Add these environment secrets to
each one using that environment's own values:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_ID`

Require reviewers for the `production` environment. Keep staging and production
as separate Supabase projects. Edge Function runtime secrets such as Turnstile,
Resend, allowed origins, and the rate-limit salt must be configured directly in
each Supabase project before deploying the function; they are not stored in
GitHub or passed through this workflow.

The workflow previews pending migrations before applying them and never uses
`--include-seed`, `db reset`, or a service-role key. Production also requires
typing `DEPLOY_PRODUCTION` when dispatching the workflow.
