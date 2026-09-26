begin;
create sequence public.guest_code_seq;
create table public.guests (
 id uuid primary key default gen_random_uuid(),
 guest_code text not null unique default ('GST-' || nextval('public.guest_code_seq')::text),
 full_name text not null check(length(btrim(full_name)) between 2 and 150),
 id_type text not null default 'OTHER' check(id_type in ('KTP','PASSPORT','SIM','OTHER')),
 id_number text not null default '' check(length(id_number)<=80 and (id_number='' or id_number ~ '^[A-Za-z0-9 -]+$')),
 nationality text not null default '' check(length(nationality)<=80),
 gender text not null default '' check(gender in ('','MALE','FEMALE','OTHER','PREFER_NOT_TO_SAY')),
 date_of_birth date check(date_of_birth between '1900-01-01'::date and (now() at time zone 'Asia/Jakarta')::date),
 phone text not null default '' check(phone='' or (length(phone)<=40 and phone ~ '^[+0-9 ().-]+$' and length(regexp_replace(phone,'[^0-9]','','g'))>=6)),
 email text not null default '' check(email='' or (length(email)<=254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')),
 address text not null default '' check(length(address)<=1000),
 company_name text not null default '' check(length(company_name)<=150),
 notes text not null default '' check(length(notes)<=2000),
 is_active boolean not null default true,
 version integer not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(id_type<>'KTP' or id_number='' or id_number ~ '^[0-9]{16}$')
);
create unique index guests_identity_unique on public.guests(id_type,lower(regexp_replace(id_number,'[[:space:]]','','g'))) where id_number<>'';
create index guests_name_idx on public.guests(lower(full_name));
create index guests_phone_idx on public.guests(phone);
create index guests_active_created_idx on public.guests(is_active,created_at desc);

-- Store changed field names, not copies of identity/contact data.
create table public.guest_activity (
 id uuid primary key default gen_random_uuid(),
 guest_id uuid not null references public.guests(id) on delete restrict,
 user_id uuid references auth.users(id) on delete set null,
 action text not null check(action in ('CREATE','UPDATE','DEACTIVATE','REACTIVATE')),
 changed_fields text[] not null,
 created_at timestamptz not null default now()
);
create index guest_activity_guest_idx on public.guest_activity(guest_id,created_at desc);
create function public.guard_guest() returns trigger language plpgsql set search_path='' as $$
begin
 new.full_name:=btrim(new.full_name);
 new.id_number:=upper(btrim(new.id_number));
 new.email:=lower(btrim(new.email));
 if tg_op='UPDATE' then
  new.version:=old.version+1;
  new.created_at:=old.created_at;
 else new.version:=1;
 end if;
 new.updated_at:=clock_timestamp();
 return new;
end; $$;
revoke all on function public.guard_guest() from public,anon,authenticated;
create trigger guest_guard before insert or update on public.guests for each row execute function public.guard_guest();

create function public.record_guest_activity() returns trigger language plpgsql security definer set search_path='' as $$
declare fields text[];
begin
 select coalesce(array_agg(entry.key order by entry.key),'{}'::text[]) into fields
 from jsonb_each(to_jsonb(new)) entry
 where entry.key not in ('id','guest_code','version','created_at','updated_at')
 and (tg_op='INSERT' or entry.value is distinct from to_jsonb(old)->entry.key);
 insert into public.guest_activity(guest_id,user_id,action,changed_fields)
 values(new.id,auth.uid(),case when tg_op='INSERT' then 'CREATE'
 when old.is_active and not new.is_active then 'DEACTIVATE'
 when not old.is_active and new.is_active then 'REACTIVATE' else 'UPDATE' end,fields);
 return new;
end; $$;
revoke all on function public.record_guest_activity() from public,anon,authenticated;
create trigger guest_activity_log after insert or update on public.guests for each row execute function public.record_guest_activity();
alter table public.guests enable row level security;
alter table public.guest_activity enable row level security;
revoke all on public.guests,public.guest_activity from anon,authenticated;
revoke all on sequence public.guest_code_seq from public,anon,authenticated;
grant usage on sequence public.guest_code_seq to authenticated;
grant select on public.guests,public.guest_activity to authenticated;
grant insert(full_name,id_type,id_number,nationality,gender,date_of_birth,phone,email,address,company_name,notes,is_active) on public.guests to authenticated;
grant update(full_name,id_type,id_number,nationality,gender,date_of_birth,phone,email,address,company_name,notes,is_active) on public.guests to authenticated;
create policy guests_read on public.guests for select to authenticated using
 ((select public.current_staff_role()) in ('OWNER','MANAGER','FRONT_OFFICE'));
create policy guests_insert on public.guests for insert to authenticated with check
 ((select public.current_staff_role()) in ('OWNER','MANAGER','FRONT_OFFICE'));
create policy guests_update on public.guests for update to authenticated using
 ((select public.current_staff_role()) in ('OWNER','MANAGER','FRONT_OFFICE')) with check
 ((select public.current_staff_role()) in ('OWNER','MANAGER','FRONT_OFFICE'));
create policy guest_activity_read on public.guest_activity for select to authenticated using
 ((select public.current_staff_role()) in ('OWNER','MANAGER','FRONT_OFFICE'));
-- No client delete or activity write grants. Codes and timestamps are DB-owned.
commit;
