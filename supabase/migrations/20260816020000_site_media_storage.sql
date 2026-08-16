-- Public marketing media served through Supabase Storage's CDN.
-- Reads are public; only active AAL2 staff can mutate objects.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'site-media',
  'site-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public reads site media" on storage.objects;
create policy "public reads site media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'site-media');

drop policy if exists "staff upload site media" on storage.objects;
create policy "staff upload site media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'site-media'
  and (storage.foldername(name))[1] in ('products', 'team', 'branding')
  and (select public.is_active_staff())
);

drop policy if exists "staff update site media" on storage.objects;
create policy "staff update site media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'site-media'
  and (select public.is_active_staff())
)
with check (
  bucket_id = 'site-media'
  and (storage.foldername(name))[1] in ('products', 'team', 'branding')
  and (select public.is_active_staff())
);

drop policy if exists "staff delete site media" on storage.objects;
create policy "staff delete site media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'site-media'
  and (select public.is_active_staff())
);

-- These deterministic paths are populated by scripts/sync-site-media.sh
-- immediately after this migration is applied by the deployment workflow.
update public.products
set image_path = case slug
  when 'normal-instant-rice' then 'products/normal-instant-rice.jpeg'
  when 'spicy-instant-rice' then 'products/spicy-instant-rice.jpeg'
  when 'premium-instant-rice' then 'products/premium-instant-rice.webp'
  when 'hibiscus-tea' then 'products/hibiscus-tea.webp'
  when 'butterfly-pea-tea' then 'products/butterfly-pea-tea.webp'
  when 'curry-leaf-tea' then 'products/curry-leaf-tea.webp'
  when 'heenbovitiya-tea' then 'products/heenbovitiya-tea.webp'
  else image_path
end
where slug in (
  'normal-instant-rice',
  'spicy-instant-rice',
  'premium-instant-rice',
  'hibiscus-tea',
  'butterfly-pea-tea',
  'curry-leaf-tea',
  'heenbovitiya-tea'
);

update public.team_members
set image_path = case slug
  when 'savina-chandrasekara' then 'team/savina-chandrasekara.webp'
  when 'pramintha-fernando' then 'team/pramintha-fernando.webp'
  when 'pulitha-wanigasekara' then 'team/pulitha-wanigasekara.webp'
  when 'heshan-chandrasekara' then 'team/heshan-chandrasekara.webp'
  when 'movini-wanasinghe' then 'team/movini-wanasinghe.jpeg'
  else image_path
end
where slug in (
  'savina-chandrasekara',
  'pramintha-fernando',
  'pulitha-wanigasekara',
  'heshan-chandrasekara',
  'movini-wanasinghe'
);

update public.site_content
set value = jsonb_set(
  value,
  '{logo}',
  to_jsonb('branding/hero/grainmuse.png'::text),
  true
)
where key = 'company';
