-- Run the whole script on a disposable development database as postgres.
begin;
insert into auth.users(id,email) values
('50000000-0000-4000-8000-000000000001','front@checkin.invalid'),
('50000000-0000-4000-8000-000000000002','denied@checkin.invalid');
update public.profiles set role='FRONT_OFFICE',is_active=true where email='front@checkin.invalid';
update public.profiles set role='HOUSEKEEPING',is_active=true where email='denied@checkin.invalid';
insert into public.guests(id,full_name) values('50000000-0000-4000-8000-000000000010','Checkin guest');
insert into public.room_types(id,name,base_price,capacity,bed_type) values
('50000000-0000-4000-8000-000000000020','Checkin type',100000,2,'Twin');
insert into public.rooms(id,room_number,room_type_id) values
('50000000-0000-4000-8000-000000000030','CI-1','50000000-0000-4000-8000-000000000020');
set local role authenticated;
select set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000001',true);
do $$
declare d jsonb; q jsonb; booking uuid; future_booking uuid; stay_id uuid; today date:=(now() at time zone 'Asia/Jakarta')::date;
begin
 d:=jsonb_build_object('guest_id','50000000-0000-4000-8000-000000000010','room_type_id','50000000-0000-4000-8000-000000000020',
 'room_id','50000000-0000-4000-8000-000000000030','check_in_date',today,'check_out_date',today+1,'adults',1,'children',0,
 'discount_amount',0,'source','WALK_IN','status','PENDING');
 q:=public.reservation_preview(d);
 booking:=public.save_reservation(d||jsonb_build_object('expected_total',q->'total_amount','expected_currency',q->'currency'));
 begin
 perform public.check_in_reservation(booking,1);
 raise exception 'Pending checkin accepted';
 exception when raise_exception then if sqlerrm<>'CHECK_IN_REQUIRES_CONFIRMED' then raise; end if; end;
 perform public.set_reservation_status(booking,1,'CONFIRMED','');
 begin
 perform public.check_in_reservation(booking,1);
 raise exception 'Stale checkin accepted';
 exception when raise_exception then if sqlerrm<>'STALE_RESERVATION' then raise; end if; end;
 d:=d||jsonb_build_object('check_in_date',today+1,'check_out_date',today+2,'status','CONFIRMED');
 q:=public.reservation_preview(d);
 future_booking:=public.save_reservation(d||jsonb_build_object('expected_total',q->'total_amount','expected_currency',q->'currency'));
 begin
 perform public.check_in_reservation(future_booking,1);
 raise exception 'Early checkin accepted';
 exception when raise_exception then if sqlerrm<>'CHECK_IN_DATE_INVALID' then raise; end if; end;
 perform set_config('checkin.test.booking',booking::text,true);
end; $$;
reset role;
update public.rooms set status='DIRTY' where room_number='CI-1';
set local role authenticated;
do $$
declare booking uuid:=current_setting('checkin.test.booking')::uuid;
begin
 begin
 perform public.check_in_reservation(booking,2);
 raise exception 'Dirty checkin accepted';
 exception when raise_exception then if sqlerrm<>'ROOM_NOT_READY' then raise; end if; end;
 if exists(select 1 from public.stays) then raise exception 'Failed checkin left a stay'; end if;
 if not exists(select 1 from public.reservations where id=booking and status='CONFIRMED' and version=2) then raise exception 'Failed checkin mutated booking'; end if;
end; $$;
reset role;
update public.rooms set status='INSPECTED' where room_number='CI-1';
set local role authenticated;
select set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000002',true);
do $$
begin
 if exists(select 1 from public.stays) then raise exception 'Housekeeping read stays'; end if;
 begin
 perform public.check_in_reservation(current_setting('checkin.test.booking')::uuid,2);
 raise exception 'Housekeeping checked in';
 exception when insufficient_privilege then null; end;
end; $$;
reset role;
update public.profiles set role='FINANCE' where email='denied@checkin.invalid';
set local role authenticated;
do $$ begin
 begin
 perform public.check_in_reservation(current_setting('checkin.test.booking')::uuid,2);
 raise exception 'Finance checked in';
 exception when insufficient_privilege then null; end;
end; $$;
reset role;
update public.profiles set role='OWNER',is_active=false where email='denied@checkin.invalid';
set local role authenticated;
do $$ begin
 begin
 perform public.check_in_reservation(current_setting('checkin.test.booking')::uuid,2);
 raise exception 'Inactive owner checked in';
 exception when insufficient_privilege then null; end;
end; $$;
select set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000001',true);
do $$
declare booking uuid:=current_setting('checkin.test.booking')::uuid; stay_id uuid;
begin
 stay_id:=public.check_in_reservation(booking,2);
 if not exists(select 1 from public.stays where id=stay_id and checked_in_by=auth.uid() and checked_out_at is null) then raise exception 'Stay missing'; end if;
 if not exists(select 1 from public.reservations where id=booking and status='CHECKED_IN' and version=3) then raise exception 'Booking not checked in'; end if;
 if not exists(select 1 from public.rooms where room_number='CI-1' and status='OCCUPIED') then raise exception 'Room not occupied'; end if;
 if not exists(select 1 from public.reservation_activity where reservation_id=booking and action='CHECKED_IN' and user_id=auth.uid()) then raise exception 'Audit missing'; end if;
 begin
 perform public.check_in_reservation(booking,3);
 raise exception 'Duplicate checkin accepted';
 exception when raise_exception then if sqlerrm<>'CHECK_IN_REQUIRES_CONFIRMED' then raise; end if; end;
 begin
 update public.stays set checked_out_at=now();
 raise exception 'Direct stay write accepted';
 exception when insufficient_privilege then null; end;
 begin
 perform public.set_reservation_status(booking,3,'CANCELLED','Test cancellation');
 raise exception 'In-house cancellation accepted';
 exception when raise_exception then if sqlerrm<>'INVALID_STATUS' then raise; end if; end;
end; $$;
reset role;
-- A trusted fixture creates a historical open stay: physical occupancy must still
-- block today's otherwise non-overlapping arrival.
update public.reservations set check_in_date=check_in_date-2,check_out_date=check_out_date-2
 where id=current_setting('checkin.test.booking')::uuid;
update public.reservations set check_in_date=check_in_date-1,check_out_date=check_out_date-1
 where status='CONFIRMED' and room_id='50000000-0000-4000-8000-000000000030';
set local role authenticated;
do $$ declare booking uuid; begin
 select id into booking from public.reservations where status='CONFIRMED' and room_id='50000000-0000-4000-8000-000000000030';
 begin
 perform public.check_in_reservation(booking,1);
 raise exception 'Overstay allowed second occupant';
 exception when raise_exception then if sqlerrm<>'ROOM_ALREADY_OCCUPIED' then raise; end if; end;
end; $$;
reset role;
set local role anon;
do $$ begin
 begin
 perform public.check_in_reservation(current_setting('checkin.test.booking')::uuid,3);
 raise exception 'Anonymous checkin accepted';
 exception when insufficient_privilege then null; end;
 begin
 perform 1 from public.stays;
 raise exception 'Anonymous read stays';
 exception when insufficient_privilege then null; end;
end; $$;
reset role;
rollback;
select 'Check-in checks passed; fixtures rolled back.' as result;
