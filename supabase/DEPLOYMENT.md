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
- `CONTACT_EMAIL_PROVIDER` - `emailjs` or `resend`
- `CONTACT_TO_EMAIL`
- For EmailJS: `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, and
  `EMAILJS_PUBLIC_KEY`; also set `EMAILJS_PRIVATE_KEY` when private-key
  authorization is enabled in EmailJS. Link the auto-reply template to the
  contact template in the EmailJS dashboard.
- For Resend: `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` using a verified domain

Do not put these values in Vite variables, Git, shell history, or this document.

## 5. Deploy and inspect the function

```bash
npx supabase functions deploy submit-contact --no-verify-jwt
```

The endpoint is intentionally public at the JWT gateway layer. It performs exact
origin validation, Turnstile verification, payload validation, and atomic rate
limiting before its privileged database insert.

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
- Notification from the configured EmailJS or Resend provider arrives at the
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
