-- PATHFINDER Academy: programs, reusable resource-person profiles, assignments,
-- and authenticated internal applications.

create type public.academy_application_status as enum (
  'submitted',
  'reviewing',
  'shortlisted',
  'accepted',
  'rejected',
  'withdrawn'
);

create table public.academy_programs (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 160),
  subtitle text check (subtitle is null or char_length(subtitle) <= 220),
  summary text check (summary is null or char_length(summary) <= 1000),
  description text check (description is null or char_length(description) <= 12000),
  hero_image_path text check (hero_image_path is null or char_length(hero_image_path) <= 500),
  objectives jsonb not null default '[]'::jsonb check (jsonb_typeof(objectives) = 'array'),
  outcomes jsonb not null default '[]'::jsonb check (jsonb_typeof(outcomes) = 'array'),
  curriculum jsonb not null default '[]'::jsonb check (jsonb_typeof(curriculum) = 'array'),
  eligibility jsonb not null default '[]'::jsonb check (jsonb_typeof(eligibility) = 'array'),
  duration_text text check (duration_text is null or char_length(duration_text) <= 120),
  delivery_mode text check (delivery_mode is null or char_length(delivery_mode) <= 80),
  venue text check (venue is null or char_length(venue) <= 240),
  start_date date,
  end_date date,
  application_deadline timestamptz,
  internal_applications_enabled boolean not null default true,
  external_application_url text check (
    external_application_url is null or
    (char_length(external_application_url) <= 1000 and external_application_url ~ '^https://')
  ),
  brochure_url text check (
    brochure_url is null or
    (char_length(brochure_url) <= 1000 and brochure_url ~ '^https://')
  ),
  seo_title text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (seo_description is null or char_length(seo_description) <= 170),
  display_order integer not null default 0 check (display_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academy_program_dates_consistent check (
    start_date is null or end_date is null or end_date >= start_date
  ),
  constraint academy_program_publication_consistent check (
    status <> 'published' or published_at is not null
  )
);

create table public.academy_resource_persons (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 160),
  professional_title text not null check (char_length(professional_title) between 1 and 200),
  organization text check (organization is null or char_length(organization) <= 200),
  short_biography text check (short_biography is null or char_length(short_biography) <= 1200),
  biography text check (biography is null or char_length(biography) <= 12000),
  image_path text check (image_path is null or char_length(image_path) <= 500),
  linkedin_url text check (
    linkedin_url is null or (char_length(linkedin_url) <= 500 and linkedin_url ~ '^https://')
  ),
  website_url text check (
    website_url is null or (char_length(website_url) <= 500 and website_url ~ '^https://')
  ),
  public_email text check (
    public_email is null or (
      char_length(public_email) between 3 and 254 and
      public_email ~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'
    )
  ),
  expertise text[] not null default '{}',
  display_order integer not null default 0 check (display_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academy_resource_person_publication_consistent check (
    status <> 'published' or published_at is not null
  )
);

create table public.academy_program_resource_persons (
  program_id uuid not null references public.academy_programs(id) on delete cascade,
  resource_person_id uuid not null references public.academy_resource_persons(id) on delete cascade,
  role text check (role is null or char_length(role) <= 160),
  session_topic text check (session_topic is null or char_length(session_topic) <= 300),
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (program_id, resource_person_id)
);

create table public.academy_applications (
  id uuid primary key default extensions.gen_random_uuid(),
  program_id uuid not null references public.academy_programs(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  full_name text not null check (char_length(full_name) between 2 and 160),
  email text not null check (
    char_length(email) between 3 and 254 and
    email ~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'
  ),
  phone text check (phone is null or char_length(phone) <= 40),
  organization text check (organization is null or char_length(organization) <= 200),
  background text check (background is null or char_length(background) <= 4000),
  motivation text not null check (char_length(motivation) between 20 and 6000),
  status public.academy_application_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (program_id, user_id)
);

create index academy_programs_public_listing_idx
  on public.academy_programs(display_order, start_date)
  where status = 'published';
create index academy_resource_persons_public_listing_idx
  on public.academy_resource_persons(display_order)
  where status = 'published';
create index academy_program_assignments_person_idx
  on public.academy_program_resource_persons(resource_person_id);
create index academy_applications_program_status_idx
  on public.academy_applications(program_id, status, created_at desc);
create index academy_applications_user_idx
  on public.academy_applications(user_id, created_at desc);

create trigger academy_programs_set_updated_at
before update on public.academy_programs
for each row execute function public.set_updated_at();
create trigger academy_resource_persons_set_updated_at
before update on public.academy_resource_persons
for each row execute function public.set_updated_at();
create trigger academy_program_resource_persons_set_updated_at
before update on public.academy_program_resource_persons
for each row execute function public.set_updated_at();
create trigger academy_applications_set_updated_at
before update on public.academy_applications
for each row execute function public.set_updated_at();

alter table public.academy_programs enable row level security;
alter table public.academy_resource_persons enable row level security;
alter table public.academy_program_resource_persons enable row level security;
alter table public.academy_applications enable row level security;

create policy "published academy programs are publicly readable"
on public.academy_programs for select to anon, authenticated
using (status = 'published');
create policy "staff manage academy programs"
on public.academy_programs for all to authenticated
using ((select public.is_active_staff()))
with check ((select public.is_active_staff()));

create policy "published academy resource persons are publicly readable"
on public.academy_resource_persons for select to anon, authenticated
using (status = 'published');
create policy "staff manage academy resource persons"
on public.academy_resource_persons for all to authenticated
using ((select public.is_active_staff()))
with check ((select public.is_active_staff()));

create policy "published academy assignments are publicly readable"
on public.academy_program_resource_persons for select to anon, authenticated
using (
  exists (
    select 1 from public.academy_programs p
    where p.id = program_id and p.status = 'published'
  ) and exists (
    select 1 from public.academy_resource_persons r
    where r.id = resource_person_id and r.status = 'published'
  )
);
create policy "staff manage academy assignments"
on public.academy_program_resource_persons for all to authenticated
using ((select public.is_active_staff()))
with check ((select public.is_active_staff()));

create policy "applicants create their own academy applications"
on public.academy_applications for insert to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'submitted'
  and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  and exists (
    select 1 from public.academy_programs p
    where p.id = program_id
      and p.status = 'published'
      and p.internal_applications_enabled = true
      and (p.application_deadline is null or p.application_deadline >= now())
  )
);
create policy "applicants read their own academy applications"
on public.academy_applications for select to authenticated
using (user_id = (select auth.uid()));
create policy "admins read academy applications"
on public.academy_applications for select to authenticated
using ((select public.is_active_admin()));
create policy "admins update academy application status"
on public.academy_applications for update to authenticated
using ((select public.is_active_admin()))
with check ((select public.is_active_admin()));

revoke all on table public.academy_programs from anon, authenticated;
revoke all on table public.academy_resource_persons from anon, authenticated;
revoke all on table public.academy_program_resource_persons from anon, authenticated;
revoke all on table public.academy_applications from anon, authenticated;

grant select on table public.academy_programs,
  public.academy_resource_persons,
  public.academy_program_resource_persons to anon, authenticated;
grant insert, update, delete on table public.academy_programs,
  public.academy_resource_persons,
  public.academy_program_resource_persons to authenticated;
grant select, insert on table public.academy_applications to authenticated;
grant update (status) on table public.academy_applications to authenticated;

-- Academy images use nested paths below academy/; public reads remain unchanged.
drop policy if exists "staff upload site media" on storage.objects;
create policy "staff upload site media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'site-media'
  and (storage.foldername(name))[1] in ('products', 'team', 'branding', 'academy')
  and (select public.is_active_staff())
);

drop policy if exists "staff update site media" on storage.objects;
create policy "staff update site media"
on storage.objects for update to authenticated
using (bucket_id = 'site-media' and (select public.is_active_staff()))
with check (
  bucket_id = 'site-media'
  and (storage.foldername(name))[1] in ('products', 'team', 'branding', 'academy')
  and (select public.is_active_staff())
);

-- Add the academy to the managed navigation without duplicating it on reruns.
update public.site_content
set value = value || jsonb_build_array(
  jsonb_build_object('label', 'PATHFINDER Academy', 'path', '/pathfinder-academy')
)
where key = 'navigation'
  and not value @> '[{"path":"/pathfinder-academy"}]'::jsonb;

comment on table public.academy_applications is
  'Private authenticated-user applications. Never expose through public academy content queries.';
