-- Disposable development database, as postgres. Run the entire script.
begin;
insert into auth.users(id,email,raw_user_meta_data) values
('40000000-0000-4000-8000-000000000001','manager@reservation.invalid','{}'),
('40000000-0000-4000-8000-000000000002','front@reservation.invalid','{}'),
('40000000-0000-4000-8000-000000000003','housekeeping@reservation.invalid','{}'),
('40000000-0000-4000-8000-000000000004','finance@reservation.invalid','{}');
update public.profiles set is_active=true,role=case id
 when '40000000-0000-4000-8000-000000000001' then 'MANAGER'::public.staff_role
 when '40000000-0000-4000-8000-000000000002' then 'FRONT_OFFICE'::public.staff_role
 when '40000000-0000-4000-8000-000000000003' then 'HOUSEKEEPING'::public.staff_role
 else 'FINANCE'::public.staff_role end where email like '%@reservation.invalid';
insert into public.guests(id,full_name) values('40000000-0000-4000-8000-000000000010','Reservation test guest');
insert into public.room_types(id,name,base_price,capacity,bed_type)
 values('40000000-0000-4000-8000-000000000020','Reservation test standard',250000,3,'Twin');
insert into public.rooms(id,room_number,room_type_id) values
('40000000-0000-4000-8000-000000000031','RT-101','40000000-0000-4000-8000-000000000020'),
('40000000-0000-4000-8000-000000000032','RT-102','40000000-0000-4000-8000-000000000020'),
('40000000-0000-4000-8000-000000000033','RT-103','40000000-0000-4000-8000-000000000020'),
('40000000-0000-4000-8000-000000000034','RT-104','40000000-0000-4000-8000-000000000020'),
('40000000-0000-4000-8000-000000000035','RT-105','40000000-0000-4000-8000-000000000020');
update public.rooms set status='MAINTENANCE' where room_number='RT-103';
update public.rooms set status='OUT_OF_ORDER' where room_number='RT-104';
update public.rooms set is_active=false where room_number='RT-105';
update public.hotel_settings set tax_percentage=10,service_charge_percentage=5,default_currency='IDR';
set local role authenticated;
select set_config('request.jwt.claim.sub','40000000-0000-4000-8000-000000000001',true);
do $$
declare d jsonb; q jsonb; booking uuid; adjacent uuid; second_booking uuid; tomorrow date:=(now() at time zone 'Asia/Jakarta')::date+10; version integer;
begin
 d:=jsonb_build_object('guest_id','40000000-0000-4000-8000-000000000010','room_type_id','40000000-0000-4000-8000-000000000020',
 'room_id','','check_in_date',tomorrow,'check_out_date',tomorrow+2,'adults',2,'children',0,'discount_amount',50000,
 'expected_currency','IDR','source','DIRECT','status','PENDING','notes','RESERVATION_TEST');
 q:=public.reservation_preview(d);
 if (q->>'total_amount')::numeric<>519750 or jsonb_array_length(q->'rooms')<>2 then raise exception 'Quote or availability incorrect'; end if;
 begin
  perform public.save_reservation(d||'{"expected_total":1}'::jsonb);
  raise exception 'Forged total accepted';
 exception when raise_exception then if sqlerrm<>'QUOTE_CHANGED' then raise; end if; end;
 booking:=public.save_reservation(d||jsonb_build_object('expected_total',519750));
 if not exists(select 1 from public.reservations where id=booking and room_id='40000000-0000-4000-8000-000000000031' and created_by=auth.uid()) then raise exception 'Automatic room allocation failed'; end if;
 q:=public.reservation_preview(d);
 if jsonb_array_length(q->'rooms')<>1 then raise exception 'Pending booking does not hold inventory'; end if;
 begin
  perform public.save_reservation(d||jsonb_build_object('expected_total',519750,'room_id','40000000-0000-4000-8000-000000000031'));
  raise exception 'Double booking accepted';
 exception when raise_exception then if sqlerrm<>'ROOM_UNAVAILABLE' then raise; end if; end;
 begin
  update public.rooms set status='MAINTENANCE' where id='40000000-0000-4000-8000-000000000031';
  raise exception 'Booked room blocked';
 exception when raise_exception then if sqlerrm<>'ROOM_HAS_RESERVATIONS' then raise; end if; end;
 begin
  update public.room_types set capacity=1 where id='40000000-0000-4000-8000-000000000020';
  raise exception 'Booked capacity lowered';
 exception when raise_exception then if sqlerrm<>'CAPACITY_HAS_RESERVATIONS' then raise; end if; end;
 begin
  update public.guests set is_active=false where id='40000000-0000-4000-8000-000000000010';
  raise exception 'Booked guest deactivated';
 exception when raise_exception then if sqlerrm<>'GUEST_HAS_RESERVATIONS' then raise; end if; end;
 second_booking:=public.save_reservation(d||jsonb_build_object('expected_total',519750));
 q:=public.reservation_preview(d);
 if jsonb_array_length(q->'rooms')<>0 then raise exception 'Sold-out inventory still available'; end if;
 begin
  perform public.save_reservation(d||jsonb_build_object('expected_total',519750));
  raise exception 'Automatic assignment overbooked inventory';
 exception when raise_exception then if sqlerrm<>'ROOM_UNAVAILABLE' then raise; end if; end;
 perform public.set_reservation_status(second_booking,1,'CANCELLED','Release test inventory');
 begin
  perform public.save_reservation(d||jsonb_build_object('expected_total',519750,'expected_currency','USD'));
  raise exception 'Currency change accepted without review';
 exception when raise_exception then if sqlerrm<>'QUOTE_CHANGED' then raise; end if; end;
 -- Same-day turnover: checkout boundary is excluded.
 q:=public.reservation_preview(d||jsonb_build_object('check_in_date',tomorrow+2,'check_out_date',tomorrow+3,'discount_amount',0));
 adjacent:=public.save_reservation(d||jsonb_build_object('check_in_date',tomorrow+2,'check_out_date',tomorrow+3,'discount_amount',0,
 'room_id','40000000-0000-4000-8000-000000000031','expected_total',(q->>'total_amount')::numeric,'notes','ADJACENT_TEST'));
 if adjacent is null then raise exception 'Adjacent booking failed'; end if;
 update public.room_types set base_price=300000 where id='40000000-0000-4000-8000-000000000020';
 q:=public.reservation_preview(d||jsonb_build_object('id',booking));
 if (q->>'total_amount')::numeric<>519750 then raise exception 'Snapshot price changed on metadata edit'; end if;
 perform public.save_reservation(d||jsonb_build_object('id',booking,'version',1,'expected_total',519750));
 begin
  perform public.save_reservation(d||jsonb_build_object('id',booking,'version',1,'expected_total',519750));
  raise exception 'Stale edit accepted';
 exception when raise_exception then if sqlerrm<>'STALE_RESERVATION' then raise; end if; end;
 begin
  perform public.set_reservation_status(booking,2,'NO_SHOW','Too early');
  raise exception 'Future no-show accepted';
 exception when raise_exception then if sqlerrm<>'NO_SHOW_TOO_EARLY' then raise; end if; end;
 perform public.set_reservation_status(booking,2,'CONFIRMED','');
 perform public.set_reservation_status(booking,3,'CANCELLED','Guest cancelled');
 q:=public.reservation_preview(d);
 if jsonb_array_length(q->'rooms')<>2 then raise exception 'Cancellation did not release room'; end if;
 if not exists(select 1 from public.reservation_activity where reservation_id=booking and action='CANCELLED') then raise exception 'Reservation audit missing'; end if;
 begin
  update public.reservations set total_amount=0 where id=booking;
  raise exception 'Direct financial write allowed';
 exception when insufficient_privilege then null; end;
end; $$;
-- Even a trusted SQL writer is subject to the exclusion constraint.
reset role;
do $$ begin
 begin
 insert into public.reservations
 select (jsonb_populate_record(null::public.reservations,to_jsonb(r)||jsonb_build_object('id',gen_random_uuid(),'reservation_number','TEST-EXCLUSION'))).*
 from public.reservations r where notes='ADJACENT_TEST';
 raise exception 'Exclusion constraint did not reject overlap';
 exception when exclusion_violation then null; end;
end; $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','40000000-0000-4000-8000-000000000002',true);
do $$
declare d jsonb; q jsonb; booking uuid;
begin
 d:=jsonb_build_object('guest_id','40000000-0000-4000-8000-000000000010','room_type_id','40000000-0000-4000-8000-000000000020',
 'room_id','','check_in_date',(now() at time zone 'Asia/Jakarta')::date,'check_out_date',(now() at time zone 'Asia/Jakarta')::date+1,
 'adults',1,'children',0,'discount_amount',1,'expected_currency','IDR','source','WALK_IN','status','CONFIRMED');
 begin
 perform public.reservation_preview(d);
 raise exception 'Front office discount accepted';
 exception when insufficient_privilege then null; end;
 d:=d||jsonb_build_object('discount_amount',0);
 q:=public.reservation_preview(d);
 booking:=public.save_reservation(d||jsonb_build_object('expected_total',(q->>'total_amount')::numeric));
 perform public.set_reservation_status(booking,1,'NO_SHOW','Did not arrive');
 if not exists(select 1 from public.reservations where id=booking and status='NO_SHOW') then raise exception 'No-show failed'; end if;
end; $$;
do $$
declare staff text;
begin
 foreach staff in array array['40000000-0000-4000-8000-000000000003','40000000-0000-4000-8000-000000000004'] loop
 perform set_config('request.jwt.claim.sub',staff,true);
 if exists(select 1 from public.reservations) then raise exception 'Unauthorized reservation read'; end if;
 begin
 perform public.save_reservation('{}'::jsonb);raise exception 'Unauthorized reservation save';
 exception when insufficient_privilege then null;end;
 end loop;
end; $$;
reset role;
set local role anon;
do $$ begin
 begin perform public.reservation_preview('{}'::jsonb);raise exception 'Anonymous RPC allowed';
 exception when insufficient_privilege then null;end;
end; $$;
reset role;
rollback;
select 'Reservation permission and booking checks passed; fixtures rolled back.' as result;
