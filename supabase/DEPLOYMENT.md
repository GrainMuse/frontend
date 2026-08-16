# Staging deployment runbook

This runbook intentionally separates database migration, Edge Function deployment,
and frontend activation. Complete every staging check before touching production.

## 1. Local verification

Docker Desktop must be running.

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:test
npm run supabase:lint
```

`supabase:reset` targets the local database because no `--linked` flag is used.

## 2. Link only the staging project

```bash
npx supabase login
npx supabase link --project-ref YOUR_STAGING_PROJECT_REFERENCE
npx supabase projects list
npx supabase migration list
```

Confirm the linked marker identifies staging. Stop if it identifies production.

Before every staging dry-run, set explicit guard values for the current shell.
Both hosted projects must already exist and the references must differ:

```powershell
$env:SUPABASE_DEPLOY_ENV = "staging"
$env:SUPABASE_STAGING_PROJECT_REF = "YOUR_STAGING_PROJECT_REFERENCE"
$env:SUPABASE_PRODUCTION_PROJECT_REF = "YOUR_PRODUCTION_PROJECT_REFERENCE"
npm.cmd run supabase:preflight:staging
```

The preflight reads the CLI's linked project reference, requires an exact staging
match, rejects the declared production reference, lists migration history, and
runs `db push --dry-run`. It never applies a migration.

If the staging project already contains manually created application tables, use
`supabase db pull` and reconcile the resulting migration before pushing anything.

## 3. Preview and apply staging migrations

```bash
npx supabase db push --dry-run
npx supabase db push
npx supabase migration list
```

Review the dry-run output before applying. Never use `db reset --linked` on a
production project.

The administrator invitation lifecycle migration must be applied before deploying
the frontend API that calls `get_admin_invitation_for_email` and
`record_admin_invitation`. Configure `ADMIN_INVITE_EXPIRY_SECONDS` on the frontend
host to match Supabase Auth's Email OTP Expiration value.

Confirm the `site-media` bucket appears under Storage after migrations are
applied. Test one upload while signed in as an MFA-verified staff member, verify
the resulting public URL loads without authentication, and confirm an anonymous
upload is rejected.

## 4. Configure Edge Function secrets

Set these in the staging project's Edge Function Secrets settings:

- `ALLOWED_ORIGINS` - exact staging frontend origin
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_EXPECTED_HOSTNAMES`
- `RATE_LIMIT_SALT` - at least 32 cryptographically random characters
- `CONTACT_EMAIL_PROVIDER` - must be `emailjs`
- `CONTACT_TO_EMAIL`
- `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_AUTOREPLY_TEMPLATE_ID`, and
  `EMAILJS_PUBLIC_KEY`; also set `EMAILJS_PRIVATE_KEY` when private-key
  authorization is enabled in EmailJS. Keep the main contact template linked to
  the existing auto-reply template. The academy processor calls that same
  auto-reply template ID directly.
- `ACADEMY_ADMIN_EMAIL` - mailbox that receives new application alerts
- `ACADEMY_NOTIFICATION_PROCESSOR_SECRET` - at least 32 random characters,
  used only by the scheduled retry invocation

Do not put these values in Vite variables, Git, shell history, or this document.
Do not remove the main contact template's linked auto-reply. Replace the existing
auto-reply template body with the conditional content documented in
`functions/process-academy-notifications/EMAILJS_TEMPLATE.md`. Academy messages
call the auto-reply template directly and therefore do not trigger another reply.

## 5. Deploy and inspect the function

```bash
npx supabase functions deploy submit-contact --no-verify-jwt
npx supabase functions deploy process-academy-notifications --no-verify-jwt
```

The endpoint is intentionally public at the JWT gateway layer. It performs exact
origin validation, Turnstile verification, payload validation, and atomic rate
limiting before its privileged database insert.

The academy notification processor accepts either a valid signed-in user token
from the configured frontend origin or the processor secret in the
`x-academy-processor-secret` header. Configure a Supabase Cron job to invoke it
every five minutes with that secret. The database outbox claims rows atomically,
reclaims locks older than 15 minutes, retries failures with exponential backoff,
and stops after five attempts. Never place the processor secret in frontend
environment variables.

After deployment, submit a staging application and verify the Email delivery tab
shows two `sent` records: the applicant confirmation and administrator alert.
Then withdraw the application and verify the withdrawal confirmation is logged.

## 6. Activate the staging frontend

```env
VITE_CONTACT_BACKEND=supabase
VITE_SUPABASE_URL=https://YOUR_STAGING_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
VITE_TURNSTILE_SITE_KEY=your_staging_site_key
```

Run one successful submission and verify all of the following:

- Browser receives HTTP 202 from `submit-contact`
- One row appears in `contact_submissions`
- Turnstile token cannot be reused
- Notification from EmailJS arrives at the
  configured mailbox
- `notification_status` becomes `sent`
- Disallowed origins receive HTTP 403
- Repeated submissions eventually receive HTTP 429
- No contact content or privileged keys appear in browser/Edge Function logs

## 7. Production promotion

Use a separate production project and production-only secrets. Repeat migration
dry-run and migration-list checks. Keep the browser-direct EmailJS fallback only
until the production function health check succeeds, then switch the frontend
variable to `supabase`. Reverting that one variable is the contact-path rollback.

Complete `ACADEMY_LAUNCH_CHECKLIST.md` before administrators enter final academy
content or the PATHFINDER routes are announced publicly.
