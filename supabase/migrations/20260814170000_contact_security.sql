-- Private, atomic rate limiting and delivery state for contact submissions.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.notification_status as enum ('pending', 'sent', 'failed');

alter table public.contact_submissions
  add column notification_status public.notification_status not null default 'pending',
  add column notification_sent_at timestamptz,
  add column notification_attempted_at timestamptz;

create table private.contact_rate_limits (
  identifier_hash text not null check (identifier_hash ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  primary key (identifier_hash, window_started_at)
);

create index contact_rate_limits_window_idx
  on private.contact_rate_limits(window_started_at);

create function public.consume_contact_rate_limit(
  p_identifier_hash text,
  p_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
  current_window timestamptz;
begin
  if p_identifier_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid rate-limit identifier';
  end if;

  if p_limit < 1 or p_limit > 100 then
    raise exception 'invalid rate-limit configuration';
  end if;

  current_window := pg_catalog.date_trunc('hour', pg_catalog.now());

  insert into private.contact_rate_limits (
    identifier_hash,
    window_started_at,
    request_count
  ) values (
    p_identifier_hash,
    current_window,
    1
  )
  on conflict (identifier_hash, window_started_at)
  do update set request_count = private.contact_rate_limits.request_count + 1
  returning request_count into current_count;

  -- Bound storage without retaining raw IP addresses or email addresses.
  delete from private.contact_rate_limits
  where window_started_at < pg_catalog.now() - interval '2 days';

  return current_count <= p_limit;
end;
$$;

revoke all on function public.consume_contact_rate_limit(text, integer)
from public, anon, authenticated;
grant execute on function public.consume_contact_rate_limit(text, integer)
to service_role;

comment on function public.consume_contact_rate_limit(text, integer) is
  'Server-only atomic fixed-window limiter. Identifiers must be SHA-256 hashes salted by the Edge Function.';
