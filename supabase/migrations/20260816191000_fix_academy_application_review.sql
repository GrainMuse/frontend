-- Correct COALESCE usage in the review RPC. COALESCE is SQL syntax and cannot
-- be schema-qualified even when the function uses an empty search path.

create or replace function public.review_academy_application(
  application_id uuid,
  next_status public.academy_application_status,
  review_notes text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_application public.academy_applications;
  review_timestamp timestamptz := pg_catalog.now();
begin
  if not public.is_active_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if pg_catalog.char_length(coalesce(review_notes, '')) > 10000 then
    raise exception 'Review notes are too long' using errcode = '22001';
  end if;

  update public.academy_applications
  set status = next_status
  where id = application_id
  returning * into updated_application;

  if updated_application.id is null then
    raise exception 'Application not found' using errcode = 'P0002';
  end if;

  insert into public.academy_application_reviews (
    application_id, notes, reviewed_by, reviewed_at
  ) values (
    application_id, coalesce(review_notes, ''), auth.uid(), review_timestamp
  )
  on conflict (application_id) do update
  set
    notes = excluded.notes,
    reviewed_by = excluded.reviewed_by,
    reviewed_at = excluded.reviewed_at;

  return pg_catalog.jsonb_build_object(
    'id', updated_application.id,
    'status', updated_application.status,
    'updatedAt', updated_application.updated_at,
    'reviewedAt', review_timestamp
  );
end;
$$;
