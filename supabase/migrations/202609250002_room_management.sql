begin;
create type public.room_status as enum ('AVAILABLE','OCCUPIED','RESERVED','DIRTY','CLEANING','CLEAN','INSPECTED','OUT_OF_ORDER','MAINTENANCE');
create table public.room_types (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(btrim(name)) between 1 and 80),
 description text not null default '' check(length(description)<=2000),
 base_price numeric(14,2) not null check(base_price between 0 and 999999999999.99),
 capacity integer not null check(capacity between 1 and 30),
 bed_type text not null check(length(btrim(bed_type)) between 1 and 100),
 size numeric(7,2) check(size > 0 and size <= 9999),
 amenities text[] not null default '{}' check(cardinality(amenities)<=30 and length(array_to_string(amenities,','))<=2000),
 is_active boolean not null default true,
 version integer not null default 1,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index room_types_name_unique on public.room_types(lower(btrim(name)));
create table public.rooms (
 id uuid primary key default gen_random_uuid(),
 room_number text not null check(room_number ~ '^[A-Za-z0-9-]{1,12}$'),
 room_type_id uuid not null references public.room_types(id) on delete restrict,
 floor integer not null default 1 check(floor between -10 and 200),
 status public.room_status not null default 'AVAILABLE',
 notes text not null default '' check(length(notes)<=2000),
 is_active boolean not null default true,
 version integer not null default 1,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index rooms_number_unique on public.rooms(lower(room_number));
create index rooms_type_idx on public.rooms(room_type_id);
create index rooms_status_active_idx on public.rooms(status,is_active);

create table public.room_activity (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id) on delete set null,
 entity_type text not null check(entity_type in ('rooms','room_types')),
 entity_id uuid not null,
 action text not null check(action in ('CREATE','UPDATE')),
 old_data jsonb, new_data jsonb not null,
 created_at timestamptz not null default now()
);
create index room_activity_entity_idx on public.room_activity(entity_type,entity_id,created_at desc);

-- RLS controls rows, column grants control fields, triggers control transitions.
create function public.guard_room_type() returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op = 'UPDATE' then
  if old.is_active and not new.is_active and exists(select 1 from public.rooms where room_type_id=old.id and is_active)
  then raise exception 'ROOM_TYPE_IN_USE' using errcode='P0001'; end if;
  new.version := old.version + 1;
  new.created_at := old.created_at;
 else new.version := 1;
 end if;
 new.updated_at := clock_timestamp();
 return new;
end; $$;
create trigger room_type_guard before insert or update on public.room_types for each row execute function public.guard_room_type();

create function public.guard_room() returns trigger language plpgsql set search_path='' as $$
declare type_active boolean; staff_role public.staff_role;
begin
 staff_role := public.current_staff_role();
 -- Lock the type against simultaneous deactivation.
 select is_active into type_active from public.room_types where id=new.room_type_id for update;
 if not found or (new.is_active and not type_active) then
  raise exception 'ROOM_TYPE_INACTIVE' using errcode='P0001';
 end if;
 if tg_op='INSERT' then
  if new.status <> 'AVAILABLE' then raise exception 'ROOM_INITIAL_STATUS' using errcode='P0001'; end if;
  new.version := 1;
 else
  if old.status in ('OCCUPIED','RESERVED') and
     (new.status<>old.status or new.room_type_id<>old.room_type_id or new.is_active<>old.is_active or new.room_number<>old.room_number)
     then raise exception 'ROOM_STAY_MANAGED' using errcode='P0001'; end if;
  if new.status<>old.status and new.status in ('OCCUPIED','RESERVED')
     then raise exception 'ROOM_STAY_MANAGED' using errcode='P0001'; end if;
  if staff_role='HOUSEKEEPING' then
   if not old.is_active or new.is_active<>old.is_active or new.room_number<>old.room_number or
      new.room_type_id<>old.room_type_id or new.floor<>old.floor or new.notes<>old.notes
      then raise exception 'ROOM_STATUS_ONLY' using errcode='42501'; end if;
   if not ((old.status='DIRTY' and new.status='CLEANING') or
           (old.status='CLEANING' and new.status='CLEAN') or
           (old.status='CLEAN' and new.status='INSPECTED') or
           (old.status='INSPECTED' and new.status='AVAILABLE'))
      then raise exception 'ROOM_INVALID_TRANSITION' using errcode='P0001'; end if;
  end if;
  new.version := old.version+1;
  new.created_at := old.created_at;
 end if;
 new.updated_at := clock_timestamp();
 return new;
end; $$;
-- SECURITY DEFINER is needed for the type lock when HOUSEKEEPING cannot UPDATE
-- room_types. Trigger is not callable as an RPC; RLS still gates room writes.
alter function public.guard_room() security definer;
revoke all on function public.guard_room() from public,anon,authenticated;
create trigger room_guard before insert or update on public.rooms for each row execute function public.guard_room();

create function public.record_room_activity() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.room_activity(user_id,entity_type,entity_id,action,old_data,new_data)
 values(auth.uid(),tg_table_name,new.id,case when tg_op='INSERT' then 'CREATE' else 'UPDATE' end,
 case when tg_op='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
 return new;
end; $$;
revoke all on function public.record_room_activity() from public,anon,authenticated;
create trigger rooms_activity after insert or update on public.rooms for each row execute function public.record_room_activity();
create trigger room_types_activity after insert or update on public.room_types for each row execute function public.record_room_activity();

alter table public.rooms enable row level security;
alter table public.room_types enable row level security;
alter table public.room_activity enable row level security;
revoke all on public.rooms,public.room_types,public.room_activity from anon,authenticated;
grant select on public.rooms,public.room_types,public.room_activity to authenticated;
grant insert (name,description,base_price,capacity,bed_type,size,amenities,is_active) on public.room_types to authenticated;
grant update (name,description,base_price,capacity,bed_type,size,amenities,is_active) on public.room_types to authenticated;
grant insert (room_number,room_type_id,floor,notes,is_active) on public.rooms to authenticated;
grant update (room_number,room_type_id,floor,status,notes,is_active) on public.rooms to authenticated;

create policy room_types_read on public.room_types for select to authenticated using
 ((select public.current_staff_role()) in ('OWNER','MANAGER','FRONT_OFFICE','HOUSEKEEPING'));
create policy room_types_insert on public.room_types for insert to authenticated with check
 ((select public.current_staff_role()) in ('OWNER','MANAGER'));
create policy room_types_update on public.room_types for update to authenticated using
 ((select public.current_staff_role()) in ('OWNER','MANAGER')) with check
 ((select public.current_staff_role()) in ('OWNER','MANAGER'));
create policy rooms_read on public.rooms for select to authenticated using
 ((select public.current_staff_role()) in ('OWNER','MANAGER','FRONT_OFFICE','HOUSEKEEPING'));
create policy rooms_insert on public.rooms for insert to authenticated with check
 ((select public.current_staff_role()) in ('OWNER','MANAGER'));
create policy rooms_update on public.rooms for update to authenticated using
 ((select public.current_staff_role()) in ('OWNER','MANAGER','HOUSEKEEPING')) with check
 ((select public.current_staff_role()) in ('OWNER','MANAGER','HOUSEKEEPING'));
create policy room_activity_read on public.room_activity for select to authenticated using
 ((select public.current_staff_role()) in ('OWNER','MANAGER','FRONT_OFFICE','HOUSEKEEPING'));
-- No DELETE policies; deactivate inventory instead. Activity has no client writes.
commit;
