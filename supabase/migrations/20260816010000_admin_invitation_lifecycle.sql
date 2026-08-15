-- Keep invitation state server-side and activate staff membership only after
-- the recipient has accepted the invite and chosen a password.

create type public.admin_invitation_status as enum (
  'pending',
  'accepted',
  'expired',
  'revoked'
);

create table private.admin_invitations (
  id uuid primary key default extensions.gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  email text not null unique check (
    email = lower(trim(email)) and char_length(email) between 3 and 254
  ),
  role public.admin_role not null,
  status public.admin_invitation_status not null default 'pending',
  invited_by uuid references auth.users(id) on delete set null,
  sent_at timestamptz not null default now(),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  resend_count integer not null default 0 check (resend_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at > sent_at),
  check ((status = 'accepted') = (accepted_at is not null)),
  check ((status = 'revoked') = (revoked_at is not null))
);

create index admin_invitations_status_expiry_idx
on private.admin_invitations(status, expires_at);

alter table private.admin_invitations enable row level security;
revoke all on table private.admin_invitations from public, anon, authenticated;

create function public.get_admin_invitation_for_email(target_email text)
returns table (
  invitation_id uuid,
  auth_user_id uuid,
  status public.admin_invitation_status,
  expires_at timestamptz,
  resend_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(trim(target_email));
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;

  update private.admin_invitations as i
  set status = 'expired', updated_at = now()
  where i.email = normalized_email
    and i.status = 'pending'
    and i.expires_at <= now();

  return query
  select i.id, i.auth_user_id, i.status, i.expires_at, i.resend_count
  from private.admin_invitations i
  where i.email = normalized_email;
end;
$$;

create function public.record_admin_invitation(
  target_user_id uuid,
  target_email text,
  target_role public.admin_role,
  invited_by_user uuid,
  expires_in_seconds integer,
  reissued boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(trim(target_email));
  invitation_id uuid;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if expires_in_seconds < 60 or expires_in_seconds > 604800 then
    raise exception 'invalid invitation expiry';
  end if;
  if not exists (
    select 1 from auth.users
    where id = target_user_id and lower(email) = normalized_email
  ) then
    raise exception 'invited auth user does not match email' using errcode = '23503';
  end if;
  if not exists (
    select 1 from public.admin_users
    where user_id = invited_by_user and role = 'admin' and active = true
  ) then
    raise exception 'inviting administrator is not active' using errcode = '42501';
  end if;

  insert into private.admin_invitations (
    auth_user_id,
    email,
    role,
    status,
    invited_by,
    sent_at,
    expires_at,
    resend_count
  ) values (
    target_user_id,
    normalized_email,
    target_role,
    'pending',
    invited_by_user,
    now(),
    now() + pg_catalog.make_interval(secs => expires_in_seconds),
    case when reissued then 1 else 0 end
  )
  on conflict (email) do update
  set auth_user_id = excluded.auth_user_id,
      role = excluded.role,
      status = 'pending',
      invited_by = excluded.invited_by,
      sent_at = excluded.sent_at,
      expires_at = excluded.expires_at,
      accepted_at = null,
      revoked_at = null,
      resend_count = private.admin_invitations.resend_count +
        case when reissued then 1 else 0 end,
      updated_at = now()
  returning id into invitation_id;

  return invitation_id;
end;
$$;

create function public.get_my_admin_invitation()
returns table (
  status public.admin_invitation_status,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    return;
  end if;

  update private.admin_invitations as i
  set status = 'expired', updated_at = now()
  where i.auth_user_id = current_user_id
    and i.status = 'pending'
    and i.expires_at <= now();

  return query
  select i.status, i.expires_at
  from private.admin_invitations i
  where i.auth_user_id = current_user_id;
end;
$$;

create function public.accept_admin_invitation()
returns public.admin_role
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  invitation private.admin_invitations%rowtype;
begin
  if current_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select * into invitation
  from private.admin_invitations
  where auth_user_id = current_user_id
  for update;

  if not found or invitation.status <> 'pending' then
    return null;
  end if;
  if invitation.expires_at <= now() then
    update private.admin_invitations
    set status = 'expired', updated_at = now()
    where id = invitation.id;
    return null;
  end if;
  if not exists (
    select 1 from auth.users
    where id = current_user_id
      and coalesce(encrypted_password, '') <> ''
  ) then
    return null;
  end if;

  insert into public.admin_users (user_id, role, active)
  values (current_user_id, invitation.role, true)
  on conflict (user_id) do update
  set role = excluded.role, active = true, updated_at = now();

  update private.admin_invitations
  set status = 'accepted', accepted_at = now(), updated_at = now()
  where id = invitation.id;

  return invitation.role;
end;
$$;

revoke all on function public.get_admin_invitation_for_email(text)
from public, anon, authenticated;
grant execute on function public.get_admin_invitation_for_email(text)
to service_role;

revoke all on function public.record_admin_invitation(
  uuid, text, public.admin_role, uuid, integer, boolean
) from public, anon, authenticated;
grant execute on function public.record_admin_invitation(
  uuid, text, public.admin_role, uuid, integer, boolean
) to service_role;

revoke all on function public.get_my_admin_invitation()
from public, anon;
grant execute on function public.get_my_admin_invitation()
to authenticated;

revoke all on function public.accept_admin_invitation()
from public, anon;
grant execute on function public.accept_admin_invitation()
to authenticated;

comment on table private.admin_invitations is
  'Server-controlled invitation lifecycle; pending users have no staff membership.';
comment on function public.accept_admin_invitation() is
  'Consumes the current authenticated user pending invitation and activates staff membership.';
