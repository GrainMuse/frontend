# PATHFINDER Academy launch checklist

Complete this checklist in staging before administrators enter final production
content or the public academy navigation is promoted.

## Platform

- Apply every migration and confirm `npm run supabase:test` passes.
- Deploy `process-academy-notifications` and `submit-contact`.
- Configure the EmailJS service, main template, existing auto-reply template, and
  academy processor secrets described in `DEPLOYMENT.md`.
- Schedule the academy notification processor every five minutes.
- Confirm the admin account has MFA and the minimum required role.

## EmailJS

- Keep the main contact template linked to its existing auto-reply.
- Paste `functions/process-academy-notifications/emailjs-template.html` into the
  existing auto-reply template.
- Configure its conditional address and subject fields using
  `functions/process-academy-notifications/EMAILJS_TEMPLATE.md`.
- Test the contact acknowledgement and all academy notification events.
- Confirm failed deliveries appear in the admin Email delivery tab and retry.

## Administrator content entry

- Create resource persons first, including accessible portrait images and public
  contact links only when consent has been recorded.
- Create programs, upload compressed program images, and assign resource persons.
- Verify dates, deadline, delivery mode, venue, external application link, SEO
  title, and SEO description before publishing.
- Preview every published program and resource-person profile on desktop and
  mobile. Draft records must remain unavailable publicly.

## Applicant journey

- Test sign-up, sign-in, password recovery, internal submission, duplicate
  prevention, external application link, withdrawal, and status display.
- Confirm internal applications remain open through the end of the configured
  deadline date and close afterward.
- Confirm the private applicant account has `noindex,nofollow` metadata.

## Release verification

```bash
npm run lint
npm run build
npm run test:contact
npm run test:academy:notifications
npm run supabase:test
npm run test:admin:e2e
```

- Validate Course and Person structured data on the staging URLs.
- Check keyboard navigation, visible focus, form errors, and mobile layouts.
- Confirm no service-role key, EmailJS private key, processor secret, applicant
  data, or private review note appears in the frontend bundle or browser logs.
- Record the production deployment time, migration version, Edge Function
  version, operator, and rollback owner.
