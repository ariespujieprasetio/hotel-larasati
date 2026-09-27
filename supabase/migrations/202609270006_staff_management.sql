begin;
alter table public.profiles add column version integer not null default 1;
-- A private counter row serializes owner removal, including concurrent updates.
-- Zero is allowed only before the first owner is bootstrapped.
create table public.staff_owner_guard (
 singleton boolean primary key default true check(singleton),
 active_owners integer not null check(active_owners>=0)
);
insert into public.staff_owner_guard(active_owners)
select count(*) from public.profiles where role='OWNER' and is_active;
alter table public.staff_owner_guard enable row level security;
revoke all on public.staff_owner_guard from public,anon,authenticated;

create function public.guard_staff_profile() returns trigger
language plpgsql security definer set search_path='' as $$
declare was_owner boolean:=false; becomes_owner boolean:=false; delta integer;
begin
 if tg_op<>'INSERT' then was_owner:=old.role='OWNER' and old.is_active; end if;
 if tg_op<>'DELETE' then becomes_owner:=new.role='OWNER' and new.is_active; end if;
 delta:=becomes_owner::integer-was_owner::integer;
 if delta<>0 then
  update public.staff_owner_guard set active_owners=active_owners+delta
  where singleton and (delta>0 or active_owners>1);
  if not found then raise exception 'LAST_ACTIVE_OWNER'; end if;
 end if;
 if tg_op='DELETE' then return old; end if;
 if tg_op='UPDATE' then new.version:=old.version+1; else new.version:=1; end if;
 return new;
end; $$;
revoke all on function public.guard_staff_profile() from public,anon,authenticated;
create trigger profiles_staff_guard before insert or update or delete on public.profiles
for each row execute function public.guard_staff_profile();

create table public.staff_activity (
 id uuid primary key default gen_random_uuid(),
 profile_id uuid not null,
 user_id uuid references auth.users(id) on delete set null,
 action text not null check(action in ('CREATE','UPDATE','DELETE')),
 changed_fields text[] not null,
 created_at timestamptz not null default clock_timestamp()
);
create index staff_activity_profile_idx on public.staff_activity(profile_id,created_at desc);
alter table public.staff_activity enable row level security;
revoke all on public.staff_activity from public,anon,authenticated;
grant select on public.staff_activity to authenticated;
create policy staff_activity_read on public.staff_activity for select to authenticated using
 ((select public.current_staff_role()) in ('OWNER','MANAGER'));

create function public.log_staff_activity() returns trigger
language plpgsql security definer set search_path='' as $$
declare fields text[];
begin
 if tg_op='DELETE' then
  insert into public.staff_activity(profile_id,user_id,action,changed_fields)
  values(old.id,auth.uid(),'DELETE','{}'); return old;
 end if;
 select coalesce(array_agg(e.key order by e.key),'{}'::text[]) into fields
 from jsonb_each(to_jsonb(new)) e
 where e.key in ('full_name','email','phone','avatar_url','role','is_active')
 and (tg_op='INSERT' or e.value is distinct from to_jsonb(old)->e.key);
 insert into public.staff_activity(profile_id,user_id,action,changed_fields)
 values(new.id,auth.uid(),case when tg_op='INSERT' then 'CREATE' else 'UPDATE' end,fields);
 return new;
end; $$;
revoke all on function public.log_staff_activity() from public,anon,authenticated;
create trigger profiles_activity after insert or update or delete on public.profiles
for each row execute function public.log_staff_activity();

create function public.update_staff_profile(p_id uuid,p_version integer,p_full_name text,p_phone text,p_role public.staff_role,p_active boolean)
returns uuid language plpgsql security definer set search_path='' as $$
declare previous public.profiles;
begin
 -- Hold the actor's role stable during the authorization-sensitive update.
 perform 1 from public.profiles where id=auth.uid() and role='OWNER' and is_active for share;
 if not found then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 if p_full_name is null or length(btrim(p_full_name)) not between 1 and 150
 or p_phone is null or length(btrim(p_phone))>40 or p_role is null or p_active is null then raise exception 'INVALID_STAFF'; end if;
 select * into previous from public.profiles where id=p_id for update;
 if not found then raise exception 'STAFF_NOT_FOUND'; end if;
 if previous.version is distinct from p_version then raise exception 'STALE_STAFF'; end if;
 update public.profiles set full_name=btrim(p_full_name),phone=nullif(btrim(p_phone),''),
 role=p_role,is_active=p_active where id=p_id;
 return p_id;
end; $$;
revoke all on function public.update_staff_profile(uuid,integer,text,text,public.staff_role,boolean) from public,anon;
grant execute on function public.update_staff_profile(uuid,integer,text,text,public.staff_role,boolean) to authenticated;
commit;
