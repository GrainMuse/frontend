-- LEAST is SQL syntax and cannot be schema-qualified.

create or replace function public.complete_academy_notification(
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
      else pg_catalog.now() + pg_catalog.make_interval(
        secs => least(3600::double precision, 30 * pg_catalog.power(2, attempts))
      )
    end
  where id = notification_id and status = 'processing';
end;
$$;
