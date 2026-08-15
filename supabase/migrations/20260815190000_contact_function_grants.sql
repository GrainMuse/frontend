-- Least-privilege grants used by the submit-contact Edge Function.

grant insert (
  name,
  email,
  phone,
  enquiry_type,
  message,
  source
) on table public.contact_submissions to service_role;

grant select (id)
on table public.contact_submissions to service_role;

grant update (
  notification_status,
  notification_attempted_at,
  notification_sent_at
) on table public.contact_submissions to service_role;

comment on table public.contact_submissions is
  'Private website enquiries. Browser roles cannot insert; the contact Edge Function receives narrowly scoped service-role column grants.';
