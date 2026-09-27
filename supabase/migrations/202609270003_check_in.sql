begin;
create table public.stays (
 id uuid primary key default gen_random_uuid(),
 reservation_id uuid not null unique references public.reservations(id),
 room_id uuid not null references public.rooms(id),
 checked_in_at timestamptz not null default clock_timestamp(),
 checked_in_by uuid not null references auth.users(id),
 checked_out_at timestamptz,
 check (checked_out_at is null or checked_out_at >= checked_in_at)
);
create unique index stays_one_open_room on public.stays(room_id) where checked_out_at is null;
alter table public.stays enable row level security;
revoke all on public.stays from public,anon,authenticated;
grant select on public.stays to authenticated;
create policy stays_read on public.stays for select to authenticated using
 ((select public.current_staff_role()) in ('OWNER','MANAGER','FRONT_OFFICE'));

-- Room guard permits OCCUPIED only when backed by a protected stay record.
-- No session flags or user-editable metadata can bypass this guard.
create or replace function public.guard_room() returns trigger language plpgsql security definer set search_path='' as $$
declare type_active boolean; staff_role public.staff_role;
begin
 staff_role := public.current_staff_role();
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
  if new.status<>old.status and new.status in ('OCCUPIED','RESERVED') and not (
    new.status='OCCUPIED' and exists(
     select 1 from public.stays s join public.reservations b on b.id=s.reservation_id
     where s.room_id=new.id and s.checked_out_at is null and b.status='CHECKED_IN'
    )
  ) then raise exception 'ROOM_STAY_MANAGED' using errcode='P0001'; end if;
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
revoke all on function public.guard_room() from public,anon,authenticated;

create function public.check_in_reservation(p_id uuid,p_version integer)
returns uuid language plpgsql security definer set search_path='' as $$
declare
 staff public.staff_role:=public.current_staff_role();
 booking public.reservations;
 room public.rooms;
 today date:=(clock_timestamp() at time zone 'Asia/Jakarta')::date;
 stay_id uuid;
begin
 if staff is null or staff not in ('OWNER','MANAGER','FRONT_OFFICE') then
  raise exception 'NOT_AUTHORIZED' using errcode='42501';
 end if;
 select * into booking from public.reservations where id=p_id for update;
 if not found then raise exception 'RESERVATION_NOT_FOUND'; end if;
 if p_version is distinct from booking.version then raise exception 'STALE_RESERVATION'; end if;
 if booking.status<>'CONFIRMED' then raise exception 'CHECK_IN_REQUIRES_CONFIRMED'; end if;
 if today<booking.check_in_date or today>=booking.check_out_date then raise exception 'CHECK_IN_DATE_INVALID'; end if;
 perform 1 from public.guests where id=booking.guest_id and is_active for share;
 if not found then raise exception 'GUEST_INACTIVE'; end if;
 perform 1 from public.room_types where id=booking.room_type_id and is_active and capacity>=booking.adults+booking.children for update;
 if not found then raise exception 'ROOM_TYPE_INACTIVE'; end if;
 select * into room from public.rooms where id=booking.room_id for update;
 if not found or not room.is_active or room.room_type_id<>booking.room_type_id then raise exception 'ROOM_UNAVAILABLE'; end if;
 if exists(select 1 from public.stays where room_id=room.id and checked_out_at is null) then raise exception 'ROOM_ALREADY_OCCUPIED'; end if;
 if room.status not in ('AVAILABLE','INSPECTED') then raise exception 'ROOM_NOT_READY'; end if;
 insert into public.stays(reservation_id,room_id,checked_in_by)
 values(booking.id,room.id,auth.uid()) returning id into stay_id;
 update public.reservations set status='CHECKED_IN',version=version+1,updated_at=clock_timestamp() where id=booking.id;
 update public.rooms set status='OCCUPIED' where id=room.id;
 return stay_id;
end; $$;
revoke all on function public.check_in_reservation(uuid,integer) from public,anon;
grant execute on function public.check_in_reservation(uuid,integer) to authenticated;
comment on table public.stays is 'Physical occupancy. Only trusted stay workflows write; an open stay blocks a room even after scheduled departure.';
commit;
