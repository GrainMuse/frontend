begin;

create extension if not exists pgtap with schema extensions;
select plan(25);

select ok((select relrowsecurity from pg_catalog.pg_class where oid = 'public.academy_programs'::regclass), 'academy programs have RLS');
select ok((select relrowsecurity from pg_catalog.pg_class where oid = 'public.academy_resource_persons'::regclass), 'academy resource persons have RLS');
select ok((select relrowsecurity from pg_catalog.pg_class where oid = 'public.academy_program_resource_persons'::regclass), 'academy assignments have RLS');
select ok((select relrowsecurity from pg_catalog.pg_class where oid = 'public.academy_applications'::regclass), 'academy applications have RLS');

select is((select count(*) from pg_catalog.pg_policies where schemaname = 'public' and tablename = 'academy_programs'), 2::bigint, 'academy programs have public and staff policies');
select is((select count(*) from pg_catalog.pg_policies where schemaname = 'public' and tablename = 'academy_resource_persons'), 2::bigint, 'resource persons have public and staff policies');
select is((select count(*) from pg_catalog.pg_policies where schemaname = 'public' and tablename = 'academy_program_resource_persons'), 2::bigint, 'assignments have public and staff policies');
select is((select count(*) from pg_catalog.pg_policies where schemaname = 'public' and tablename = 'academy_applications'), 5::bigint, 'applications have applicant lifecycle and admin policies');

select ok(has_table_privilege('anon', 'public.academy_programs', 'select'), 'anonymous visitors can query programs through RLS');
select ok(has_table_privilege('anon', 'public.academy_resource_persons', 'select'), 'anonymous visitors can query resource persons through RLS');
select ok(has_table_privilege('anon', 'public.academy_program_resource_persons', 'select'), 'anonymous visitors can query published assignments through RLS');
select isnt(has_table_privilege('anon', 'public.academy_applications', 'select'), true, 'anonymous visitors cannot read applications');
select isnt(has_table_privilege('anon', 'public.academy_applications', 'insert'), true, 'anonymous visitors cannot create internal applications');
select ok(has_table_privilege('authenticated', 'public.academy_applications', 'insert'), 'authenticated users can submit applications through RLS');
select isnt(has_table_privilege('authenticated', 'public.academy_applications', 'delete'), true, 'browser clients cannot delete applications');

select ok(exists(select 1 from pg_catalog.pg_indexes where schemaname = 'public' and indexname = 'academy_programs_public_listing_idx'), 'program listing index exists');
select ok(exists(select 1 from pg_catalog.pg_indexes where schemaname = 'public' and indexname = 'academy_resource_persons_public_listing_idx'), 'resource-person listing index exists');
select ok(exists(select 1 from pg_catalog.pg_indexes where schemaname = 'public' and indexname = 'academy_program_assignments_person_idx'), 'reverse assignment index exists');
select ok(exists(select 1 from pg_catalog.pg_indexes where schemaname = 'public' and indexname = 'academy_applications_program_status_idx'), 'application review index exists');

select ok(exists(select 1 from pg_catalog.pg_trigger where tgname = 'academy_programs_set_updated_at'), 'program updated-at trigger exists');
select ok(exists(select 1 from pg_catalog.pg_trigger where tgname = 'academy_resource_persons_set_updated_at'), 'resource-person updated-at trigger exists');
select ok(exists(select 1 from pg_catalog.pg_trigger where tgname = 'academy_program_resource_persons_set_updated_at'), 'assignment updated-at trigger exists');
select ok(exists(select 1 from pg_catalog.pg_trigger where tgname = 'academy_applications_set_updated_at'), 'application updated-at trigger exists');

select ok(exists(select 1 from pg_catalog.pg_constraint where conname = 'academy_program_dates_consistent'), 'program date consistency is enforced');
select ok(exists(select 1 from pg_catalog.pg_constraint where conname = 'academy_applications_program_id_user_id_key'), 'one application per user and program is enforced');

select * from finish();
rollback;
