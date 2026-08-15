# Supabase development workflow

This directory contains the version-controlled backend definition for Grain Muse.

Use [DEPLOYMENT.md](./DEPLOYMENT.md) for the ordered staging and production
promotion checklist.

## Environment boundaries

- Use separate Supabase projects for staging and production.
- Use the local Supabase stack for development when Docker and the Supabase CLI are available.
- Never link a developer workstation to production for routine migration testing.
- Apply migrations to staging and test authorization before promoting them to production.

## Security invariants

- Every table exposed through the Data API has Row Level Security enabled.
- Anonymous users can only read rows whose status is `published`.
- Browsers cannot insert contact submissions directly.
- `admin_users` membership is never writable by browser roles.
- Admin policies require an MFA-backed `aal2` session.
- MFA-backed editors manage content; only administrators can access enquiries.
- Supabase secret/service-role keys must never use a `VITE_` environment variable.

## Contact function configuration

Copy `functions/.env.example` to `functions/.env.local` and use test credentials
for local development. For a hosted project, set each value through Edge Function
Secrets Management. Never commit the populated file.

The `submit-contact` function requires:

- Exact comma-separated origins in `ALLOWED_ORIGINS` (no wildcard)
- Cloudflare Turnstile secret and expected hostnames
- A random `RATE_LIMIT_SALT` of at least 32 characters
  - `CONTACT_EMAIL_PROVIDER=emailjs` with EmailJS service, contact-template,
    auto-reply-template, and public-key settings, or
    `CONTACT_EMAIL_PROVIDER=resend` with a Resend API key and verified sender
- A destination mailbox in `CONTACT_TO_EMAIL`

With EmailJS, address the contact template to the Grain Muse mailbox and configure
the auto-reply template's recipient as `{{to_email}}`.
Set `EMAILJS_PRIVATE_KEY` when private-key authorization is enabled in the
EmailJS account. These are Edge Function secrets, not browser `VITE_` values.

Run validation tests with:

```bash
npm run test:contact
```

Serve the function locally after starting the Supabase stack. This explicitly
loads the ignored local environment file:

```bash
npm run supabase:functions
```

The checked-in example uses Cloudflare's official always-pass test credentials.
The direct dummy token is `XXXX.DUMMY.TOKEN.XXXX`; these credentials must never
be copied to staging or production. Placeholder email-provider credentials
intentionally exercise notification failure handling: the enquiry remains stored, its
`notification_status` becomes `failed`, and the endpoint returns HTTP 202 with
`notificationSent: false` instead of encouraging a duplicate browser retry.

On Windows, the default project script excludes the optional Analytics and
Vector services so Docker does not need to expose its unauthenticated daemon on
TCP port 2375:

```bash
npm run supabase:start
```

Use `npm run supabase:start:full` only when local Logs Explorer support is
required and Docker Desktop has been configured for the Analytics service.

The hybrid production path uses the Supabase contact backend so every accepted
enquiry is stored before EmailJS or Resend notification delivery is attempted.

## Local browser integration test

Use these browser-safe values in the ignored project-root `.env.local`:

```env
VITE_CONTACT_BACKEND=supabase
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=the_publishable_key_from_supabase_status
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

Run the three local processes in separate terminals:

```bash
npm run supabase:start
npm run supabase:functions
npm run dev
```

With placeholder provider credentials from `functions/.env.local`, a successful
browser test displays the stored-enquiry confirmation and delayed-notification
notice. Inspect the synthetic row in local Studio, then delete it after testing.
Restart Vite whenever a `VITE_` value changes because those values are loaded at
dev-server startup.

## Frontend staging switch

Configure these browser-safe variables only in the staging frontend deployment:

```env
VITE_CONTACT_BACKEND=supabase
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
VITE_TURNSTILE_SITE_KEY=your_staging_site_key
```

Use `VITE_CONTACT_BACKEND=supabase` in production after verification. Switching
to `emailjs` remains an emergency browser-direct fallback, but fallback submissions
are not stored in the admin enquiry database.

Turnstile is rendered explicitly for the React SPA. Its token is cleared and the
widget is reset after failed submissions because verification tokens are single-use.

## Database-managed public content

Products, product categories, team profiles, company details, navigation, brand
values, and process steps are database-managed content. The
`20260815210000_seed_public_content.sql` migration imports the original frontend
catalogue records idempotently and publishes 2 categories, 7 products, and 5 team
members. `20260815220000_site_content.sql` imports the remaining four content
documents. The React application loads them through `ContentProvider`; the local
data module now contains only visual theme constants.

The frontend content service exposes create, read, update, and delete operations for
categories, products, and team members. Public sessions can only read published rows.
Writes require an authenticated active staff account with an `aal2` MFA session, as
enforced by RLS in PostgreSQL—not by hiding controls in React.

Apply pending content migrations locally without resetting existing data:

```bash
npx supabase migration up --local
```

For hosted environments, promote the migration to staging first using the deployment
preflight. Do not run local seed scripts manually against production.
