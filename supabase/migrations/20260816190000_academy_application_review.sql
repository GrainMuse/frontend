-- Private administrator review notes and immutable application status history.

create table public.academy_application_reviews (
  application_id uuid primary key references public.academy_applications(id) on delete cascade,
  notes text not null default '' check (char_length(notes) <= 10000),
  reviewed_by uuid not null references auth.users(id) on delete restrict,
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.academy_application_status_history (
  id bigint generated always as identity primary key,
  application_id uuid not null references public.academy_applications(id) on delete cascade,
  from_status public.academy_application_status,
  to_status public.academy_application_status not null,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index academy_application_history_application_idx
  on public.academy_application_status_history(application_id, created_at desc);

create trigger academy_application_reviews_set_updated_at
before update on public.academy_application_reviews
for each row execute function public.set_updated_at();

create function public.record_academy_application_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status is distinct from new.status then
    insert into public.academy_application_status_history (
      application_id, from_status, to_status, changed_by
    ) values (
      new.id, old.status, new.status, auth.uid()
    );
  end if;
  return new;
end;
$$;

create trigger academy_application_status_history_insert
after update of status on public.academy_applications
for each row execute function public.record_academy_application_status_change();

create function public.review_academy_application(
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
  if pg_catalog.char_length(pg_catalog.coalesce(review_notes, '')) > 10000 then
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
    application_id, pg_catalog.coalesce(review_notes, ''), auth.uid(), review_timestamp
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

revoke all on function public.record_academy_application_status_change() from public, anon, authenticated;
revoke all on function public.review_academy_application(uuid, public.academy_application_status, text) from public, anon;
grant execute on function public.review_academy_application(uuid, public.academy_application_status, text) to authenticated;

alter table public.academy_application_reviews enable row level security;
alter table public.academy_application_status_history enable row level security;

create policy "admins read academy application reviews"
on public.academy_application_reviews for select to authenticated
using ((select public.is_active_admin()));

create policy "admins read academy application status history"
on public.academy_application_status_history for select to authenticated
using ((select public.is_active_admin()));

revoke all on table public.academy_application_reviews from anon, authenticated;
revoke all on table public.academy_application_status_history from anon, authenticated;
grant select on table public.academy_application_reviews,
  public.academy_application_status_history to authenticated;

comment on table public.academy_application_reviews is
  'Private administrator notes. Applicants must never receive these records.';
comment on table public.academy_application_status_history is
  'Immutable audit trail created automatically whenever an application status changes.';
