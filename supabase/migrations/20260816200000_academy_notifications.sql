-- Durable, retry-safe PATHFINDER Academy email notification outbox.

create type public.academy_notification_event as enum (
  'application_submitted',
  'admin_new_application',
  'application_withdrawn',
  'application_status_changed'
);

create type public.academy_notification_delivery_status as enum (
  'pending',
  'processing',
  'sent',
  'failed'
);

create table public.academy_notification_outbox (
  id uuid primary key default extensions.gen_random_uuid(),
  application_id uuid not null references public.academy_applications(id) on delete cascade,
  event_type public.academy_notification_event not null,
  recipient_email text,
  idempotency_key text not null unique check (char_length(idempotency_key) <= 300),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  status public.academy_notification_delivery_status not null default 'pending',
  attempts smallint not null default 0 check (attempts between 0 and 10),
  next_attempt_at timestamptz not null default now(),
  locked_at timestamptz,
  provider_message_id text check (provider_message_id is null or char_length(provider_message_id) <= 300),
  last_error text check (last_error is null or char_length(last_error) <= 500),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index academy_notification_outbox_claim_idx
  on public.academy_notification_outbox(next_attempt_at, created_at)
  where status in ('pending', 'failed', 'processing');
create index academy_notification_outbox_application_idx
  on public.academy_notification_outbox(application_id, created_at desc);

create trigger academy_notification_outbox_set_updated_at
before update on public.academy_notification_outbox
for each row execute function public.set_updated_at();

create function public.enqueue_academy_application_notifications()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  program_title text;
begin
  select title into program_title
  from public.academy_programs
  where id = new.program_id;

  if tg_op = 'INSERT' then
    insert into public.academy_notification_outbox (
      application_id, event_type, recipient_email, idempotency_key, payload
    ) values
      (
        new.id,
        'application_submitted',
        new.email,
        'academy:' || new.id::text || ':submitted:applicant',
        pg_catalog.jsonb_build_object(
          'applicantName', new.full_name,
          'programTitle', program_title,
          'status', new.status
        )
      ),
      (
        new.id,
        'admin_new_application',
        null,
        'academy:' || new.id::text || ':submitted:admin',
        pg_catalog.jsonb_build_object(
          'applicantName', new.full_name,
          'applicantEmail', new.email,
          'programTitle', program_title,
          'status', new.status
        )
      )
    on conflict (idempotency_key) do nothing;
    return new;
  end if;

  if old.status is distinct from new.status and new.status = 'withdrawn' then
    insert into public.academy_notification_outbox (
      application_id, event_type, recipient_email, idempotency_key, payload
    ) values (
      new.id,
      'application_withdrawn',
      new.email,
      'academy:' || new.id::text || ':withdrawn:applicant',
      pg_catalog.jsonb_build_object(
        'applicantName', new.full_name,
        'programTitle', program_title,
        'status', new.status
      )
    ) on conflict (idempotency_key) do nothing;
  elsif old.status is distinct from new.status
    and new.status in ('shortlisted', 'accepted', 'rejected') then
    insert into public.academy_notification_outbox (
      application_id, event_type, recipient_email, idempotency_key, payload
    ) values (
      new.id,
      'application_status_changed',
      new.email,
      'academy:' || new.id::text || ':status:' || new.status::text,
      pg_catalog.jsonb_build_object(
        'applicantName', new.full_name,
        'programTitle', program_title,
        'status', new.status
      )
    ) on conflict (idempotency_key) do nothing;
  end if;

  return new;
end;
$$;

create trigger academy_application_notification_insert
after insert on public.academy_applications
for each row execute function public.enqueue_academy_application_notifications();
create trigger academy_application_notification_status
after update of status on public.academy_applications
for each row execute function public.enqueue_academy_application_notifications();

create function public.claim_academy_notifications(batch_size integer default 20)
returns setof public.academy_notification_outbox
language plpgsql
security definer
set search_path = ''
as $$
begin
  if batch_size < 1 or batch_size > 100 then
    raise exception 'Batch size must be between 1 and 100' using errcode = '22023';
  end if;

  return query
  with candidates as (
    select id
    from public.academy_notification_outbox
    where attempts < 5
      and next_attempt_at <= pg_catalog.now()
      and (
        status in ('pending', 'failed')
        or (status = 'processing' and locked_at < pg_catalog.now() - interval '15 minutes')
      )
    order by created_at
    for update skip locked
    limit batch_size
  )
  update public.academy_notification_outbox as notification
  set
    status = 'processing',
    attempts = notification.attempts + 1,
    locked_at = pg_catalog.now(),
    last_error = null
  from candidates
  where notification.id = candidates.id
  returning notification.*;
end;
$$;

create function public.complete_academy_notification(
  notification_id uuid,
  delivered boolean,
  provider_id text default null,
  failure_message text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.academy_notification_outbox
  set
    status = case when delivered then 'sent'::public.academy_notification_delivery_status else 'failed'::public.academy_notification_delivery_status end,
    provider_message_id = case when delivered then pg_catalog.left(provider_id, 300) else null end,
    last_error = case when delivered then null else pg_catalog.left(coalesce(failure_message, 'Delivery failed'), 500) end,
    sent_at = case when delivered then pg_catalog.now() else null end,
    locked_at = null,
    next_attempt_at = case
      when delivered then next_attempt_at
      else pg_catalog.now() + pg_catalog.make_interval(secs => pg_catalog.least(3600, 30 * pg_catalog.power(2, attempts)))
    end
  where id = notification_id and status = 'processing';
end;
$$;

alter table public.academy_notification_outbox enable row level security;

create policy "admins read academy notification delivery logs"
on public.academy_notification_outbox for select to authenticated
using ((select public.is_active_admin()));

revoke all on function public.enqueue_academy_application_notifications() from public, anon, authenticated;
revoke all on function public.claim_academy_notifications(integer) from public, anon, authenticated;
revoke all on function public.complete_academy_notification(uuid, boolean, text, text) from public, anon, authenticated;
grant execute on function public.claim_academy_notifications(integer) to service_role;
grant execute on function public.complete_academy_notification(uuid, boolean, text, text) to service_role;

revoke all on table public.academy_notification_outbox from anon, authenticated;
grant select on table public.academy_notification_outbox to authenticated;
grant select, insert, update on table public.academy_notification_outbox to service_role;

comment on table public.academy_notification_outbox is
  'Private retry-safe email queue. Applicants cannot read delivery records or enqueue arbitrary messages.';
