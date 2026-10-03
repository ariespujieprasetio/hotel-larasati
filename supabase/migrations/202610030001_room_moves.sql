begin;

create or replace function public.guard_room() returns trigger language plpgsql security definer set search_path='' as $$
declare type_active boolean; staff_role public.staff_role;
begin
 staff_role := public.current_staff_role();
 select is_active into type_active from public.room_types where id=new.room_type_id for update;
 if not found or (new.is_active and not type_active) then raise exception 'ROOM_TYPE_INACTIVE' using errcode='P0001'; end if;
 if tg_op='INSERT' then
  if new.status <> 'AVAILABLE' then raise exception 'ROOM_INITIAL_STATUS' using errcode='P0001'; end if;
  new.version := 1;
 else
  if old.status in ('OCCUPIED','RESERVED') and
     (new.status<>old.status or new.room_type_id<>old.room_type_id or new.is_active<>old.is_active or new.room_number<>old.room_number)
     and not (old.status='OCCUPIED' and new.status='DIRTY' and current_setting('app.room_move',true)='1'
       and new.room_type_id=old.room_type_id and new.is_active=old.is_active and new.room_number=old.room_number)
     then raise exception 'ROOM_STAY_MANAGED' using errcode='P0001'; end if;
  if new.status<>old.status and new.status in ('OCCUPIED','RESERVED') and not (
    new.status='OCCUPIED' and exists(select 1 from public.stays s join public.reservations b on b.id=s.reservation_id
      where s.room_id=new.id and s.checked_out_at is null and b.status='CHECKED_IN'))
    then raise exception 'ROOM_STAY_MANAGED' using errcode='P0001'; end if;
  if staff_role='HOUSEKEEPING' then
   if not old.is_active or new.is_active<>old.is_active or new.room_number<>old.room_number or new.room_type_id<>old.room_type_id or new.floor<>old.floor or new.notes<>old.notes then raise exception 'ROOM_STATUS_ONLY' using errcode='42501'; end if;
   if not ((old.status='DIRTY' and new.status='CLEANING') or (old.status='CLEANING' and new.status='CLEAN') or (old.status='CLEAN' and new.status='INSPECTED') or (old.status='INSPECTED' and new.status='AVAILABLE')) then raise exception 'ROOM_INVALID_TRANSITION' using errcode='P0001'; end if;
  end if;
  new.version := old.version+1; new.created_at := old.created_at;
 end if;
 new.updated_at := clock_timestamp(); return new;
end; $$;
revoke all on function public.guard_room() from public,anon,authenticated;

create table public.room_move_activity (
 id uuid primary key default gen_random_uuid(),
 reservation_id uuid not null references public.reservations(id),
 stay_id uuid not null references public.stays(id),
 from_room_id uuid not null references public.rooms(id),
 to_room_id uuid not null references public.rooms(id),
 reason text not null check(length(btrim(reason)) between 3 and 500),
 user_id uuid not null references auth.users(id),
 created_at timestamptz not null default clock_timestamp()
);
create index room_move_activity_reservation_idx on public.room_move_activity(reservation_id,created_at desc);
alter table public.room_move_activity enable row level security;
revoke all on public.room_move_activity from public,anon,authenticated;
grant select on public.room_move_activity to authenticated;
create policy room_move_activity_read on public.room_move_activity for select to authenticated using
 ((select public.current_staff_role()) in ('OWNER','MANAGER','FRONT_OFFICE'));

create function public.move_checked_in_guest(p_reservation uuid,p_version integer,p_room uuid,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare staff public.staff_role:=public.current_staff_role(); booking public.reservations; stay public.stays; old_room public.rooms; new_room public.rooms; f public.folios; label text:=btrim(p_reason);
begin
 if staff is null or staff not in ('OWNER','MANAGER','FRONT_OFFICE') then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 if p_reservation is null or p_room is null or label is null or length(label) not between 3 and 500 then raise exception 'INVALID_ROOM_MOVE'; end if;
 select * into booking from public.reservations where id=p_reservation for update;
 if not found then raise exception 'RESERVATION_NOT_FOUND'; end if;
 if booking.status<>'CHECKED_IN' or booking.version is distinct from p_version then raise exception 'STALE_OR_NOT_CHECKED_IN'; end if;
 if booking.room_id=p_room then raise exception 'SAME_ROOM'; end if;
 select * into stay from public.stays where reservation_id=booking.id and checked_out_at is null for update;
 if not found then raise exception 'STAY_NOT_FOUND'; end if;
 select * into old_room from public.rooms where id=stay.room_id for update;
 select * into new_room from public.rooms where id=p_room for update;
 if not found or not new_room.is_active or new_room.status not in ('AVAILABLE','INSPECTED') then raise exception 'ROOM_NOT_READY'; end if;
 if new_room.room_type_id<>booking.room_type_id then raise exception 'ROOM_TYPE_MISMATCH'; end if;
 if exists(select 1 from public.stays where room_id=new_room.id and checked_out_at is null) then raise exception 'ROOM_ALREADY_OCCUPIED'; end if;
 if exists(select 1 from public.reservations where room_id=new_room.id and id<>booking.id and status in ('PENDING','CONFIRMED','CHECKED_IN') and daterange(check_in_date,check_out_date,'[)') && daterange(booking.check_in_date,booking.check_out_date,'[)')) then raise exception 'ROOM_HAS_RESERVATION'; end if;
 select * into f from public.folios where reservation_id=booking.id for update;
 set local app.room_move='1';
 update public.stays set room_id=new_room.id where id=stay.id;
 update public.reservations set room_id=new_room.id,version=version+1,updated_at=clock_timestamp() where id=booking.id;
 if found and f.id is not null then update public.folios set room_number=new_room.room_number,version=version+1 where id=f.id; end if;
 update public.rooms set status='DIRTY' where id=old_room.id;
 update public.rooms set status='OCCUPIED' where id=new_room.id;
 insert into public.room_move_activity(reservation_id,stay_id,from_room_id,to_room_id,reason,user_id)
 values(booking.id,stay.id,old_room.id,new_room.id,label,auth.uid());
 return booking.id;
end; $$;
revoke all on function public.move_checked_in_guest(uuid,integer,uuid,text) from public,anon;
grant execute on function public.move_checked_in_guest(uuid,integer,uuid,text) to authenticated;
commit;
