-- Trusted membership provisioning for the server-side administrator invitation flow.
-- Browser roles cannot execute this function or write admin_users directly.

create function public.provision_admin_user(
  target_user_id uuid,
  target_role public.admin_role
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;

  if not exists (
    select 1 from auth.users where id = target_user_id
  ) then
    raise exception 'auth user does not exist' using errcode = '23503';
  end if;

  insert into public.admin_users (user_id, role, active)
  values (target_user_id, target_role, true)
  on conflict (user_id) do update
  set role = excluded.role, active = true, updated_at = now();
end;
$$;

revoke all on function public.provision_admin_user(uuid, public.admin_role)
from public, anon, authenticated;
grant execute on function public.provision_admin_user(uuid, public.admin_role)
to service_role;

comment on function public.provision_admin_user(uuid, public.admin_role) is
  'Server-only helper used after a trusted Auth invitation succeeds.';
