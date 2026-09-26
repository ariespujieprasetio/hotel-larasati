-- Phase 1: one hotel, staff-only authentication and configuration.
begin;
create type public.staff_role as enum ('OWNER', 'MANAGER', 'FRONT_OFFICE', 'HOUSEKEEPING', 'FINANCE');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (length(btrim(full_name)) between 1 and 150),
  email text not null check (length(email) between 3 and 254),
  role public.staff_role not null default 'FRONT_OFFICE',
  phone text check (length(phone) <= 40),
  avatar_url text check (length(avatar_url) <= 2048),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index profiles_email_unique on public.profiles (lower(email));
create index profiles_active_role_idx on public.profiles (role) where is_active;

create table public.hotel_settings (
  id uuid primary key default '00000000-0000-0000-0000-000000000001'
    check (id = '00000000-0000-0000-0000-000000000001'::uuid),
  hotel_name text not null default 'Hotel Larasati' check (length(btrim(hotel_name)) between 1 and 150),
  address text check (length(address) <= 1000),
  phone text check (length(phone) <= 40),
  email text check (length(email) <= 254),
  logo_url text check (length(logo_url) <= 2048),
  check_in_time time not null default '14:00',
  check_out_time time not null default '12:00',
  default_currency text not null default 'IDR' check (default_currency ~ '^[A-Z]{3}$'),
  tax_percentage numeric(5,2) not null default 0 check (tax_percentage between 0 and 100),
  service_charge_percentage numeric(5,2) not null default 0 check (service_charge_percentage between 0 and 100),
  invoice_prefix text not null default 'INV' check (invoice_prefix ~ '^[A-Z0-9-]{1,12}$'),
  reservation_prefix text not null default 'RES' check (reservation_prefix ~ '^[A-Z0-9-]{1,12}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Real initial configuration, not fabricated operational or guest data.
insert into public.hotel_settings default values;

create function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end;
$$;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger hotel_settings_updated_at before update on public.hotel_settings
for each row execute function public.set_updated_at();

-- Fixed, non-dynamic function avoids recursive profile policies. No role is
-- read from user-editable auth metadata.
create function public.current_staff_role()
returns public.staff_role language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = (select auth.uid()) and is_active;
$$;
revoke all on function public.current_staff_role() from public, anon;
grant execute on function public.current_staff_role() to authenticated;

-- New auth accounts have no operational access until explicitly activated.
create function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, role, is_active)
  values (
    new.id,
    new.email,
    left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)), 150),
    'FRONT_OFFICE',
    false
  );
  return new;
end;
$$;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_auth_user();

create function public.sync_profile_email()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;
revoke all on function public.sync_profile_email() from public, anon, authenticated;
create trigger on_auth_user_email_changed after update of email on auth.users
for each row when (old.email is distinct from new.email)
execute function public.sync_profile_email();

alter table public.profiles enable row level security;
alter table public.hotel_settings enable row level security;

revoke all on public.profiles, public.hotel_settings from anon, authenticated;
grant select on public.profiles, public.hotel_settings to authenticated;
-- Identifiers, timestamps and auth-owned email cannot be mutated through the API.
grant update (full_name, phone, avatar_url, role, is_active) on public.profiles to authenticated;
grant update (hotel_name, address, phone, email, logo_url, check_in_time,
  check_out_time, default_currency, tax_percentage, service_charge_percentage,
  invoice_prefix, reservation_prefix) on public.hotel_settings to authenticated;

create policy profiles_read on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or (select public.current_staff_role()) in ('OWNER', 'MANAGER')
);
create policy profiles_owner_update on public.profiles for update to authenticated
using ((select public.current_staff_role()) = 'OWNER')
with check ((select public.current_staff_role()) = 'OWNER');
create policy settings_staff_read on public.hotel_settings for select to authenticated
using ((select public.current_staff_role()) is not null);
create policy settings_management_update on public.hotel_settings for update to authenticated
using ((select public.current_staff_role()) in ('OWNER', 'MANAGER'))
with check ((select public.current_staff_role()) in ('OWNER', 'MANAGER'));

-- Intentionally no client INSERT/DELETE policies for either table.
comment on table public.profiles is 'Auth users provisioned by administrators; inactive by default.';
comment on table public.hotel_settings is 'Single Hotel Larasati configuration; manager/owner writes only.';
commit;

