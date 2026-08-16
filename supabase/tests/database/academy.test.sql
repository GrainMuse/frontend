begin;

create extension if not exists pgtap with schema extensions;
select plan(49);

select ok((select relrowsecurity from pg_catalog.pg_class where oid = 'public.academy_programs'::regclass), 'academy programs have RLS');
select ok((select relrowsecurity from pg_catalog.pg_class where oid = 'public.academy_resource_persons'::regclass), 'academy resource persons have RLS');
select ok((select relrowsecurity from pg_catalog.pg_class where oid = 'public.academy_program_resource_persons'::regclass), 'academy assignments have RLS');
select ok((select relrowsecurity from pg_catalog.pg_class where oid = 'public.academy_applications'::regclass), 'academy applications have RLS');
select ok((select relrowsecurity from pg_catalog.pg_class where oid = 'public.academy_application_reviews'::regclass), 'academy application reviews have RLS');
select ok((select relrowsecurity from pg_catalog.pg_class where oid = 'public.academy_application_status_history'::regclass), 'academy application history has RLS');
select ok((select relrowsecurity from pg_catalog.pg_class where oid = 'public.academy_notification_outbox'::regclass), 'academy notification outbox has RLS');

select is((select count(*) from pg_catalog.pg_policies where schemaname = 'public' and tablename = 'academy_programs'), 2::bigint, 'academy programs have public and staff policies');
select is((select count(*) from pg_catalog.pg_policies where schemaname = 'public' and tablename = 'academy_resource_persons'), 2::bigint, 'resource persons have public and staff policies');
select is((select count(*) from pg_catalog.pg_policies where schemaname = 'public' and tablename = 'academy_program_resource_persons'), 2::bigint, 'assignments have public and staff policies');
select is((select count(*) from pg_catalog.pg_policies where schemaname = 'public' and tablename = 'academy_applications'), 5::bigint, 'applications have applicant lifecycle and admin policies');
select is((select count(*) from pg_catalog.pg_policies where schemaname = 'public' and tablename = 'academy_application_reviews'), 1::bigint, 'reviews have an administrator read policy');
select is((select count(*) from pg_catalog.pg_policies where schemaname = 'public' and tablename = 'academy_application_status_history'), 1::bigint, 'history has an administrator read policy');
select is((select count(*) from pg_catalog.pg_policies where schemaname = 'public' and tablename = 'academy_notification_outbox'), 1::bigint, 'notification logs have an administrator read policy');

select ok(has_table_privilege('anon', 'public.academy_programs', 'select'), 'anonymous visitors can query programs through RLS');
select ok(has_table_privilege('anon', 'public.academy_resource_persons', 'select'), 'anonymous visitors can query resource persons through RLS');
select ok(has_table_privilege('anon', 'public.academy_program_resource_persons', 'select'), 'anonymous visitors can query published assignments through RLS');
select isnt(has_table_privilege('anon', 'public.academy_applications', 'select'), true, 'anonymous visitors cannot read applications');
select isnt(has_table_privilege('anon', 'public.academy_applications', 'insert'), true, 'anonymous visitors cannot create internal applications');
select ok(has_table_privilege('authenticated', 'public.academy_applications', 'insert'), 'authenticated users can submit applications through RLS');
select isnt(has_table_privilege('authenticated', 'public.academy_applications', 'delete'), true, 'browser clients cannot delete applications');
select isnt(has_table_privilege('anon', 'public.academy_application_reviews', 'select'), true, 'anonymous visitors cannot read review notes');
select isnt(has_table_privilege('authenticated', 'public.academy_application_reviews', 'insert'), true, 'browser clients cannot directly insert review notes');
select isnt(has_table_privilege('authenticated', 'public.academy_application_status_history', 'insert'), true, 'browser clients cannot forge status history');
select isnt(has_table_privilege('anon', 'public.academy_notification_outbox', 'select'), true, 'anonymous visitors cannot read notification logs');
select ok(has_table_privilege('authenticated', 'public.academy_notification_outbox', 'select'), 'authenticated administrators can query logs through RLS');
select isnt(has_table_privilege('authenticated', 'public.academy_notification_outbox', 'insert'), true, 'browser clients cannot enqueue arbitrary email');
select ok(has_table_privilege('service_role', 'public.academy_notification_outbox', 'insert'), 'notification processor can enqueue delivery records');

select ok(exists(select 1 from pg_catalog.pg_indexes where schemaname = 'public' and indexname = 'academy_programs_public_listing_idx'), 'program listing index exists');
select ok(exists(select 1 from pg_catalog.pg_indexes where schemaname = 'public' and indexname = 'academy_resource_persons_public_listing_idx'), 'resource-person listing index exists');
select ok(exists(select 1 from pg_catalog.pg_indexes where schemaname = 'public' and indexname = 'academy_program_assignments_person_idx'), 'reverse assignment index exists');
select ok(exists(select 1 from pg_catalog.pg_indexes where schemaname = 'public' and indexname = 'academy_applications_program_status_idx'), 'application review index exists');
select ok(exists(select 1 from pg_catalog.pg_indexes where schemaname = 'public' and indexname = 'academy_application_history_application_idx'), 'application history index exists');
select ok(exists(select 1 from pg_catalog.pg_indexes where schemaname = 'public' and indexname = 'academy_notification_outbox_claim_idx'), 'notification claim index exists');
select ok(exists(select 1 from pg_catalog.pg_indexes where schemaname = 'public' and indexname = 'academy_notification_outbox_application_idx'), 'notification application index exists');

select ok(exists(select 1 from pg_catalog.pg_trigger where tgname = 'academy_programs_set_updated_at'), 'program updated-at trigger exists');
select ok(exists(select 1 from pg_catalog.pg_trigger where tgname = 'academy_resource_persons_set_updated_at'), 'resource-person updated-at trigger exists');
select ok(exists(select 1 from pg_catalog.pg_trigger where tgname = 'academy_program_resource_persons_set_updated_at'), 'assignment updated-at trigger exists');
select ok(exists(select 1 from pg_catalog.pg_trigger where tgname = 'academy_applications_set_updated_at'), 'application updated-at trigger exists');
select ok(exists(select 1 from pg_catalog.pg_trigger where tgname = 'academy_application_status_history_insert'), 'application status audit trigger exists');
select ok(exists(select 1 from pg_catalog.pg_trigger where tgname = 'academy_notification_outbox_set_updated_at'), 'notification updated-at trigger exists');
select ok(exists(select 1 from pg_catalog.pg_trigger where tgname = 'academy_application_notification_insert'), 'application insert notification trigger exists');
select ok(exists(select 1 from pg_catalog.pg_trigger where tgname = 'academy_application_notification_status'), 'application status notification trigger exists');

select isnt(has_function_privilege('authenticated', 'public.claim_academy_notifications(integer)', 'execute'), true, 'browser users cannot claim the email queue');
select ok(has_function_privilege('service_role', 'public.claim_academy_notifications(integer)', 'execute'), 'processor can claim the email queue');
select ok(has_function_privilege('service_role', 'public.complete_academy_notification(uuid,boolean,text,text)', 'execute'), 'processor can complete email delivery');
select isnt(has_function_privilege('authenticated', 'public.enqueue_academy_application_notifications()', 'execute'), true, 'browser users cannot invoke the enqueue trigger function');

select ok(exists(select 1 from pg_catalog.pg_constraint where conname = 'academy_program_dates_consistent'), 'program date consistency is enforced');
select ok(exists(select 1 from pg_catalog.pg_constraint where conname = 'academy_applications_program_id_user_id_key'), 'one application per user and program is enforced');

select * from finish();
rollback;
