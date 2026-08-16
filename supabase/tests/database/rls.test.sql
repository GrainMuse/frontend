begin;

create extension if not exists pgtap with schema extensions;
select plan(67);

-- Schema protection is never optional for Data API tables.
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.product_categories'::regclass),
  'product_categories has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.products'::regclass),
  'products has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.team_members'::regclass),
  'team_members has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.admin_users'::regclass),
  'admin_users has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.contact_submissions'::regclass),
  'contact_submissions has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.site_content'::regclass),
  'site_content has RLS enabled'
);

select ok(
  exists(select 1 from storage.buckets where id = 'site-media'),
  'site-media storage bucket exists'
);
select ok(
  (select public from storage.buckets where id = 'site-media'),
  'site-media is publicly readable through the CDN'
);
select is(
  (select file_size_limit from storage.buckets where id = 'site-media'),
  5242880::bigint,
  'site-media limits uploads to 5 MB'
);
select results_eq(
  $$select unnest(allowed_mime_types) from storage.buckets
    where id = 'site-media' order by 1$$,
  $$values ('image/avif'::text), ('image/jpeg'), ('image/png'), ('image/webp')$$,
  'site-media accepts only supported web image formats'
);
select is(
  (select count(*) from pg_catalog.pg_policies
   where schemaname = 'storage'
     and tablename = 'objects'
     and policyname in (
       'public reads site media',
       'staff delete site media',
       'staff update site media',
       'staff upload site media'
     )),
  4::bigint,
  'site-media has explicit public-read and staff-write policies'
);
select is(
  (select count(*) from public.products
   where image_path ~ '^products/.+\.(jpeg|webp)$'),
  7::bigint,
  'seeded products reference their CDN object paths'
);
select is(
  (select count(*) from public.team_members
   where image_path ~ '^team/.+\.(jpeg|webp)$'),
  5::bigint,
  'seeded team members reference their CDN object paths'
);
select is(
  (select value ->> 'logo' from public.site_content where key = 'company'),
  'branding/hero/grainmuse.png',
  'company branding references its CDN object path'
);

-- Table/function grants remain least-privilege even if a policy is changed later.
select ok(
  not pg_catalog.has_table_privilege('anon', 'public.contact_submissions', 'SELECT'),
  'anonymous users cannot select contact submissions'
);
select ok(
  not pg_catalog.has_table_privilege('anon', 'public.contact_submissions', 'INSERT'),
  'anonymous users cannot insert contact submissions directly'
);
select ok(
  not pg_catalog.has_table_privilege('anon', 'public.products', 'INSERT'),
  'anonymous users cannot create products'
);
select ok(
  not pg_catalog.has_table_privilege('anon', 'public.site_content', 'INSERT'),
  'anonymous users cannot create site content'
);
select ok(
  not pg_catalog.has_table_privilege('authenticated', 'public.contact_submissions', 'INSERT'),
  'authenticated users cannot insert contact submissions directly'
);
select ok(
  not pg_catalog.has_table_privilege('anon', 'public.admin_users', 'SELECT'),
  'anonymous users cannot read administrator membership'
);
select ok(
  not pg_catalog.has_function_privilege(
    'anon',
    'public.consume_contact_rate_limit(text,integer)',
    'EXECUTE'
  ),
  'anonymous users cannot execute the server-side rate limiter'
);
select ok(
  not pg_catalog.has_column_privilege(
    'authenticated',
    'public.contact_submissions',
    'name',
    'UPDATE'
  ),
  'browser roles cannot rewrite submitted contact details'
);
select ok(
  pg_catalog.has_column_privilege(
    'authenticated',
    'public.contact_submissions',
    'status',
    'UPDATE'
  ),
  'authenticated administrators may update enquiry status when RLS permits it'
);
select ok(
  pg_catalog.has_column_privilege(
    'service_role',
    'public.contact_submissions',
    'name',
    'INSERT'
  ),
  'the contact function may insert submitted contact fields'
);
select ok(
  pg_catalog.has_column_privilege(
    'service_role',
    'public.contact_submissions',
    'id',
    'SELECT'
  ),
  'the contact function may read back the inserted identifier'
);
select ok(
  pg_catalog.has_column_privilege(
    'service_role',
    'public.contact_submissions',
    'notification_status',
    'UPDATE'
  ),
  'the contact function may update notification delivery state'
);
select ok(
  not pg_catalog.has_column_privilege(
    'service_role',
    'public.contact_submissions',
    'name',
    'UPDATE'
  ),
  'the contact function cannot rewrite submitted contact details'
);
select ok(
  not pg_catalog.has_function_privilege(
    'anon',
    'public.provision_admin_user(uuid,public.admin_role)',
    'EXECUTE'
  ),
  'anonymous users cannot provision staff membership'
);
select ok(
  not pg_catalog.has_function_privilege(
    'authenticated',
    'public.provision_admin_user(uuid,public.admin_role)',
    'EXECUTE'
  ),
  'browser-authenticated users cannot provision staff membership'
);
select ok(
  pg_catalog.has_function_privilege(
    'service_role',
    'public.provision_admin_user(uuid,public.admin_role)',
    'EXECUTE'
  ),
  'the trusted invitation server can provision staff membership'
);
select ok(
  not pg_catalog.has_function_privilege(
    'anon',
    'public.record_admin_invitation(uuid,text,public.admin_role,uuid,integer,boolean)',
    'EXECUTE'
  ),
  'anonymous users cannot record staff invitations'
);
select ok(
  not pg_catalog.has_function_privilege(
    'authenticated',
    'public.record_admin_invitation(uuid,text,public.admin_role,uuid,integer,boolean)',
    'EXECUTE'
  ),
  'browser-authenticated users cannot record staff invitations'
);
select ok(
  pg_catalog.has_function_privilege(
    'service_role',
    'public.record_admin_invitation(uuid,text,public.admin_role,uuid,integer,boolean)',
    'EXECUTE'
  ),
  'the trusted invitation server can record staff invitations'
);
select ok(
  pg_catalog.has_function_privilege(
    'authenticated',
    'public.get_my_admin_invitation()',
    'EXECUTE'
  ),
  'an invited authenticated user can inspect their invitation status'
);
select ok(
  pg_catalog.has_function_privilege(
    'authenticated',
    'public.accept_admin_invitation()',
    'EXECUTE'
  ),
  'an invited authenticated user can consume their invitation'
);

-- Fixtures are created as the migration owner before assuming API roles.
insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at
) values
  ('10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'editor@example.test', '', now(), now(), now()),
  ('10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'admin@example.test', '', now(), now(), now()),
  ('10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'pending@example.test', '', now(), now(), now()),
  ('10000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'expired@example.test', '', now(), now(), now());

insert into public.admin_users (user_id, role) values
  ('10000000-0000-0000-0000-000000000001', 'editor'),
  ('10000000-0000-0000-0000-000000000002', 'admin');

insert into public.product_categories (id, slug, name, status, display_order) values
  ('20000000-0000-0000-0000-000000000001', 'published-category', 'Published', 'published', 1),
  ('20000000-0000-0000-0000-000000000002', 'draft-category', 'Draft', 'draft', 2);

insert into public.products (
  category_id, slug, name, status, published_at, display_order
) values
  ('20000000-0000-0000-0000-000000000001', 'published-product', 'Published product', 'published', now(), 1),
  ('20000000-0000-0000-0000-000000000002', 'draft-product', 'Draft product', 'draft', null, 2);

insert into public.team_members (
  slug, name, position, status, published_at, display_order
) values
  ('published-member', 'Published member', 'Tester', 'published', now(), 1),
  ('draft-member', 'Draft member', 'Tester', 'draft', null, 2);

insert into public.contact_submissions (name, email, message)
values ('Test Contact', 'contact@example.test', 'A private contact message.');

-- Anonymous users see published catalogue content only.
select set_config('request.jwt.claims', '{"role":"anon","aal":"aal1"}', true);
set local role anon;
select results_eq(
  'select count(*)::bigint from public.product_categories where slug in (''rice'', ''tea'')',
  'values (2::bigint)',
  'the imported product categories are publicly readable'
);
select results_eq(
  'select count(*)::bigint from public.products where slug in (''normal-instant-rice'', ''spicy-instant-rice'', ''premium-instant-rice'', ''hibiscus-tea'', ''butterfly-pea-tea'', ''curry-leaf-tea'', ''heenbovitiya-tea'')',
  'values (7::bigint)',
  'all imported products are publicly readable'
);
select results_eq(
  'select count(*)::bigint from public.team_members where slug in (''savina-chandrasekara'', ''pramintha-fernando'', ''pulitha-wanigasekara'', ''heshan-chandrasekara'', ''movini-wanasinghe'')',
  'values (5::bigint)',
  'all imported team members are publicly readable'
);
select results_eq(
  'select count(*)::bigint from public.site_content where key in (''company'', ''navigation'', ''values'', ''process_steps'')',
  'values (4::bigint)',
  'all imported site content is publicly readable'
);
select results_eq(
  'select count(*)::bigint from public.products where slug in (''published-product'', ''draft-product'')',
  'values (1::bigint)',
  'anonymous users see only published products'
);
select results_eq(
  'select count(*)::bigint from public.team_members where slug in (''published-member'', ''draft-member'')',
  'values (1::bigint)',
  'anonymous users see only published team members'
);
reset role;

-- An editor without MFA receives only the public view.
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal1"}',
  true
);
set local role authenticated;
select results_eq(
  'select count(*)::bigint from public.products where slug in (''published-product'', ''draft-product'')',
  'values (1::bigint)',
  'an editor without MFA cannot read drafts'
);
reset role;

-- An MFA-backed editor can manage content but cannot read enquiries.
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal2"}',
  true
);
set local role authenticated;
select results_eq(
  'select count(*)::bigint from public.products where slug in (''published-product'', ''draft-product'')',
  'values (2::bigint)',
  'an MFA-backed editor can read draft content'
);
select results_eq(
  'select count(*)::bigint from public.contact_submissions where email = ''contact@example.test''',
  'values (0::bigint)',
  'an editor cannot read contact submissions'
);
select lives_ok(
  $$insert into public.team_members (slug, name, position) values ('crud-test-member', 'CRUD Test', 'Tester')$$,
  'an MFA-backed editor can create content'
);
select lives_ok(
  $$update public.team_members set position = 'Updated Tester' where slug = 'crud-test-member'$$,
  'an MFA-backed editor can update content'
);
select lives_ok(
  $$delete from public.team_members where slug = 'crud-test-member'$$,
  'an MFA-backed editor can delete content'
);
select lives_ok(
  $$insert into public.site_content (key, value) values ('crud_test', '{"test":true}'::jsonb)$$,
  'an MFA-backed editor can create site content'
);
select lives_ok(
  $$update public.site_content set value = '{"test":false}'::jsonb where key = 'crud_test'$$,
  'an MFA-backed editor can update site content'
);
select lives_ok(
  $$delete from public.site_content where key = 'crud_test'$$,
  'an MFA-backed editor can delete site content'
);
reset role;

-- An administrator still needs MFA before private enquiries are visible.
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated","aal":"aal1"}',
  true
);
set local role authenticated;
select results_eq(
  'select count(*)::bigint from public.contact_submissions where email = ''contact@example.test''',
  'values (0::bigint)',
  'an administrator without MFA cannot read contact submissions'
);
reset role;

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated","aal":"aal2"}',
  true
);
set local role authenticated;
select results_eq(
  'select count(*)::bigint from public.contact_submissions where email = ''contact@example.test''',
  'values (1::bigint)',
  'an MFA-backed administrator can read contact submissions'
);
reset role;

-- The private rate limiter permits the configured count and rejects the next.
set local role service_role;
select ok(
  public.consume_contact_rate_limit(repeat('a', 64), 3),
  'rate limiter permits the first request'
);
select ok(
  public.consume_contact_rate_limit(repeat('a', 64), 3),
  'rate limiter permits the second request'
);
select ok(
  public.consume_contact_rate_limit(repeat('a', 64), 3),
  'rate limiter permits the final configured request'
);
select ok(
  not public.consume_contact_rate_limit(repeat('a', 64), 3),
  'rate limiter rejects a request over the configured limit'
);
reset role;

-- Staff membership is deferred until the invited user accepts a valid pending record.
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000000","role":"service_role"}',
  true
);
set local role service_role;
select lives_ok(
  $$select public.record_admin_invitation(
    '10000000-0000-0000-0000-000000000003',
    'pending@example.test',
    'editor',
    '10000000-0000-0000-0000-000000000002',
    3600,
    false
  )$$,
  'the trusted server records a pending invitation'
);
reset role;

select results_eq(
  $$select count(*)::bigint from public.admin_users
    where user_id = '10000000-0000-0000-0000-000000000003'$$,
  'values (0::bigint)',
  'pending invitation has no active staff membership'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated","aal":"aal1"}',
  true
);
set local role authenticated;
select results_eq(
  'select status::text from public.get_my_admin_invitation()',
  $$values ('pending'::text)$$,
  'the invited user sees their pending status'
);
select results_eq(
  'select public.accept_admin_invitation() is null',
  'values (true)',
  'a pending invitation cannot activate membership before a password is set'
);
reset role;

update auth.users
set encrypted_password = 'test-password-hash', updated_at = now()
where id = '10000000-0000-0000-0000-000000000003';

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated","aal":"aal1"}',
  true
);
set local role authenticated;
select results_eq(
  'select public.accept_admin_invitation()::text',
  $$values ('editor'::text)$$,
  'the invited user consumes the pending role'
);
reset role;

select results_eq(
  $$select role::text from public.admin_users
    where user_id = '10000000-0000-0000-0000-000000000003'$$,
  $$values ('editor'::text)$$,
  'membership is activated only after acceptance'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000000","role":"service_role"}',
  true
);
set local role service_role;
select results_eq(
  $$select status::text from public.get_admin_invitation_for_email('pending@example.test')$$,
  $$values ('accepted'::text)$$,
  'the server records the accepted lifecycle state'
);
select lives_ok(
  $$select public.record_admin_invitation(
    '10000000-0000-0000-0000-000000000004',
    'expired@example.test',
    'admin',
    '10000000-0000-0000-0000-000000000002',
    3600,
    false
  )$$,
  'the trusted server records another pending invitation'
);
reset role;

update private.admin_invitations
set sent_at = now() - interval '2 hours',
    expires_at = now() - interval '1 hour'
where email = 'expired@example.test';

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated","aal":"aal1"}',
  true
);
set local role authenticated;
select results_eq(
  'select status::text from public.get_my_admin_invitation()',
  $$values ('expired'::text)$$,
  'an overdue pending invitation is marked expired'
);
select results_eq(
  'select public.accept_admin_invitation() is null',
  'values (true)',
  'an expired invitation cannot activate membership'
);
reset role;

select results_eq(
  $$select count(*)::bigint from public.admin_users
    where user_id = '10000000-0000-0000-0000-000000000004'$$,
  'values (0::bigint)',
  'expired invitation leaves no staff membership'
);

select * from finish();
rollback;
