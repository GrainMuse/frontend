-- Grain Muse initial application schema.
-- All exposed tables use deny-by-default Row Level Security.

create extension if not exists pgcrypto with schema extensions;

create type public.content_status as enum ('draft', 'published', 'archived');
create type public.admin_role as enum ('editor', 'admin');
create type public.enquiry_status as enum ('new', 'in_progress', 'resolved', 'spam');

create table public.product_categories (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 80),
  display_order integer not null default 0 check (display_order >= 0),
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default extensions.gen_random_uuid(),
  category_id uuid not null references public.product_categories(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 120),
  subtitle text check (subtitle is null or char_length(subtitle) <= 160),
  tagline text check (tagline is null or char_length(tagline) <= 160),
  description text check (description is null or char_length(description) <= 1000),
  long_description text check (long_description is null or char_length(long_description) <= 8000),
  accent_color text check (accent_color is null or accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  image_path text check (image_path is null or char_length(image_path) <= 500),
  nutrition jsonb not null default '{}'::jsonb check (jsonb_typeof(nutrition) = 'object'),
  tags text[] not null default '{}',
  highlights text[] not null default '{}',
  badge text check (badge is null or char_length(badge) <= 40),
  display_order integer not null default 0 check (display_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_publication_consistent check (
    status <> 'published' or published_at is not null
  )
);

create table public.team_members (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 120),
  position text not null check (char_length(position) between 1 and 160),
  department text check (department is null or char_length(department) <= 100),
  biography text check (biography is null or char_length(biography) <= 8000),
  quote text check (quote is null or char_length(quote) <= 1000),
  image_path text check (image_path is null or char_length(image_path) <= 500),
  linkedin_url text check (linkedin_url is null or char_length(linkedin_url) <= 500),
  instagram_url text check (instagram_url is null or char_length(instagram_url) <= 500),
  skills text[] not null default '{}',
  joined_year smallint check (joined_year is null or joined_year between 1900 and 2200),
  display_order integer not null default 0 check (display_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_publication_consistent check (
    status <> 'published' or published_at is not null
  )
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.admin_role not null default 'editor',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_submissions (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (phone is null or char_length(phone) <= 30),
  enquiry_type text check (enquiry_type is null or char_length(enquiry_type) <= 60),
  message text not null check (char_length(message) between 10 and 4000),
  status public.enquiry_status not null default 'new',
  source text not null default 'website' check (char_length(source) <= 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on public.products(category_id);
create index products_public_listing_idx
  on public.products(display_order, published_at desc)
  where status = 'published';
create index product_categories_public_listing_idx
  on public.product_categories(display_order)
  where status = 'published';
create index team_members_public_listing_idx
  on public.team_members(display_order)
  where status = 'published';
create index contact_submissions_status_created_at_idx
  on public.contact_submissions(status, created_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

create trigger product_categories_set_updated_at
before update on public.product_categories
for each row execute function public.set_updated_at();
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();
create trigger team_members_set_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();
create trigger contact_submissions_set_updated_at
before update on public.contact_submissions
for each row execute function public.set_updated_at();

create function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and active = true
      and coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
  );
$$;

create function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and role = 'admin'
      and active = true
      and coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
  );
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.is_active_staff() from public, anon;
revoke all on function public.is_active_admin() from public, anon;
grant execute on function public.is_active_staff() to authenticated;
grant execute on function public.is_active_admin() to authenticated;

alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.team_members enable row level security;
alter table public.admin_users enable row level security;
alter table public.contact_submissions enable row level security;

create policy "published categories are publicly readable"
on public.product_categories for select
to anon, authenticated
using (status = 'published');

create policy "published products are publicly readable"
on public.products for select
to anon, authenticated
using (status = 'published');

create policy "published team members are publicly readable"
on public.team_members for select
to anon, authenticated
using (status = 'published');

create policy "staff manage categories"
on public.product_categories for all
to authenticated
using ((select public.is_active_staff()))
with check ((select public.is_active_staff()));

create policy "staff manage products"
on public.products for all
to authenticated
using ((select public.is_active_staff()))
with check ((select public.is_active_staff()));

create policy "staff manage team members"
on public.team_members for all
to authenticated
using ((select public.is_active_staff()))
with check ((select public.is_active_staff()));

create policy "admins read their membership"
on public.admin_users for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_active_admin()));

create policy "admins read contact submissions"
on public.contact_submissions for select
to authenticated
using ((select public.is_active_admin()));

create policy "admins update contact submission status"
on public.contact_submissions for update
to authenticated
using ((select public.is_active_admin()))
with check ((select public.is_active_admin()));

revoke all on table public.product_categories from anon, authenticated;
revoke all on table public.products from anon, authenticated;
revoke all on table public.team_members from anon, authenticated;
revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.contact_submissions from anon, authenticated;

grant select on table public.product_categories, public.products, public.team_members
to anon, authenticated;
grant insert, update, delete on table public.product_categories, public.products, public.team_members
to authenticated;
grant select on table public.admin_users to authenticated;
grant select on table public.contact_submissions to authenticated;
grant update (status) on table public.contact_submissions to authenticated;

comment on table public.contact_submissions is
  'Private enquiries. Inserts must use the secured submit-contact Edge Function; never grant anonymous insert access.';
comment on table public.admin_users is
  'Managed only through trusted server-side or dashboard operations.';
