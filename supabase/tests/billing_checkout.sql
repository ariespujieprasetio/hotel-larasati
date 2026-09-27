-- Disposable development database only. All fixtures roll back.
begin;
insert into auth.users(id,email) values
('60000000-0000-4000-8000-000000000001','owner@billing.invalid'),
('60000000-0000-4000-8000-000000000002','finance@billing.invalid'),
('60000000-0000-4000-8000-000000000003','front@billing.invalid'),
('60000000-0000-4000-8000-000000000004','housekeeping@billing.invalid');
update public.profiles set is_active=true,role=case
 when email='owner@billing.invalid' then 'OWNER'::public.staff_role
 when email='finance@billing.invalid' then 'FINANCE'::public.staff_role
 when email='front@billing.invalid' then 'FRONT_OFFICE'::public.staff_role
 else 'HOUSEKEEPING'::public.staff_role end where email like '%@billing.invalid';
insert into public.guests(id,full_name) values('60000000-0000-4000-8000-000000000010','Billing test guest');
insert into public.room_types(id,name,base_price,capacity,bed_type)
 values('60000000-0000-4000-8000-000000000020','Billing test type',100000,2,'Twin');
insert into public.rooms(id,room_number,room_type_id) values
('60000000-0000-4000-8000-000000000030','BILL-1','60000000-0000-4000-8000-000000000020'),
('60000000-0000-4000-8000-000000000031','BILL-2','60000000-0000-4000-8000-000000000020');
update public.hotel_settings set tax_percentage=0,service_charge_percentage=0,default_currency='IDR';
set local role authenticated;
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000001',true);
do $$
declare d jsonb; q jsonb; booking uuid; f public.folios; today date:=(now() at time zone 'Asia/Jakarta')::date;
begin
 d:=jsonb_build_object('guest_id','60000000-0000-4000-8000-000000000010','room_type_id','60000000-0000-4000-8000-000000000020',
 'room_id','60000000-0000-4000-8000-000000000030','check_in_date',today,'check_out_date',today+2,'adults',1,'children',0,
 'discount_amount',0,'source','DIRECT','status','CONFIRMED','expected_currency','IDR','expected_total',200000);
 booking:=public.save_reservation(d);
 perform public.check_in_reservation(booking,1);
 select * into f from public.folios where reservation_id=booking;
 if not found or f.total_amount<>200000 or f.balance<>200000 or f.paid_amount<>0 or f.guest_name<>'Billing test guest' then raise exception 'Folio snapshot incorrect'; end if;
 perform set_config('billing.test.folio',f.id::text,true);
 perform set_config('billing.test.booking',booking::text,true);
 begin
 perform public.check_out_reservation(f.id,1);
 raise exception 'Unpaid checkout succeeded';
 exception when raise_exception then if sqlerrm<>'BALANCE_DUE' then raise; end if; end;
 if not exists(select 1 from public.rooms where room_number='BILL-1' and status='OCCUPIED') or not exists(select 1 from public.stays where reservation_id=booking and checked_out_at is null) then raise exception 'Failed checkout changed occupancy'; end if;
 begin
 perform public.record_payment(f.id,gen_random_uuid(),0,'CASH','');
 raise exception 'Zero payment accepted';
 exception when raise_exception then if sqlerrm<>'INVALID_PAYMENT' then raise; end if; end;
 begin
 perform public.record_payment(f.id,gen_random_uuid(),0.001,'CASH','');
 raise exception 'Fractional cent accepted';
 exception when raise_exception then if sqlerrm<>'INVALID_PAYMENT' then raise; end if; end;
 begin
 perform public.record_payment(f.id,gen_random_uuid(),1,'CARD','');
 raise exception 'Missing reference accepted';
 exception when raise_exception then if sqlerrm<>'INVALID_PAYMENT' then raise; end if; end;
 begin
 update public.folios set paid_amount=total_amount where id=f.id;
 raise exception 'Direct balance update accepted';
 exception when insufficient_privilege then null; end;
 d:=d||jsonb_build_object('room_id','60000000-0000-4000-8000-000000000031','discount_amount',200000,'expected_total',0);
 booking:=public.save_reservation(d);
 perform public.check_in_reservation(booking,1);
 select * into f from public.folios where reservation_id=booking;
 perform public.check_out_reservation(f.id,1);
 if not exists(select 1 from public.folios where id=f.id and closed_at is not null and paid_amount=0) then raise exception 'Zero bill checkout failed'; end if;
end; $$;
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000002',true);
do $$
declare f uuid:=current_setting('billing.test.folio')::uuid; request_id uuid:='60000000-0000-4000-8000-000000000050';
begin
 if not exists(select 1 from public.folios where id=f) then raise exception 'Finance cannot read folio'; end if;
 if exists(select 1 from public.guests) then raise exception 'Finance gained guest access'; end if;
 perform public.record_payment(f,request_id,50000,'BANK_TRANSFER','BANK-123');
 perform public.record_payment(f,request_id,50000,'BANK_TRANSFER','BANK-123');
 if (select count(*) from public.payments where id=request_id)<>1 or (select paid_amount from public.folios where id=f)<>50000 then raise exception 'Duplicate request double charged'; end if;
 begin
 perform public.record_payment(f,request_id,40000,'BANK_TRANSFER','BANK-123');
 raise exception 'Reused key accepted different amount';
 exception when raise_exception then if sqlerrm<>'PAYMENT_REQUEST_CONFLICT' then raise; end if; end;
 begin
 perform public.record_payment(f,gen_random_uuid(),150001,'CASH','');
 raise exception 'Overpayment accepted';
 exception when raise_exception then if sqlerrm<>'PAYMENT_EXCEEDS_BALANCE' then raise; end if; end;
 begin
 perform public.reverse_payment(request_id,'Wrong account');
 raise exception 'Finance reversed payment';
 exception when insufficient_privilege then null; end;
 begin
 perform public.check_out_reservation(f,2);
 raise exception 'Finance checked out';
 exception when insufficient_privilege then null; end;
 begin
 delete from public.payments where id=request_id;
 raise exception 'Payment deleted';
 exception when insufficient_privilege then null; end;
end; $$;
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000001',true);
do $$
declare f uuid:=current_setting('billing.test.folio')::uuid; first_id uuid; second_id uuid;
begin
 first_id:=public.reverse_payment('60000000-0000-4000-8000-000000000050','Wrong recorded payment');
 second_id:=public.reverse_payment('60000000-0000-4000-8000-000000000050','Retry correction');
 if first_id<>second_id or (select paid_amount from public.folios where id=f)<>0 then raise exception 'Reversal retry incorrect'; end if;
 if (select count(*) from public.payments where folio_id=f)<>2 then raise exception 'Reversal lost original entry'; end if;
end; $$;
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000003',true);
do $$
declare f uuid:=current_setting('billing.test.folio')::uuid; request_id uuid:='60000000-0000-4000-8000-000000000051'; v integer;
begin
 perform public.record_payment(f,request_id,200000,'CASH','');
 begin
 perform public.reverse_payment(request_id,'Not allowed');
 raise exception 'Front office reversed payment';
 exception when insufficient_privilege then null; end;
 begin
 perform public.check_out_reservation(f,1);
 raise exception 'Stale folio checkout accepted';
 exception when raise_exception then if sqlerrm<>'STALE_FOLIO' then raise; end if; end;
 select version into v from public.folios where id=f;
 perform public.check_out_reservation(f,v);
 if not exists(select 1 from public.reservations where id=current_setting('billing.test.booking')::uuid and status='CHECKED_OUT') then raise exception 'Booking not checked out'; end if;
 if not exists(select 1 from public.rooms where room_number='BILL-1' and status='DIRTY') then raise exception 'Room not dirty'; end if;
 if not exists(select 1 from public.stays where reservation_id=current_setting('billing.test.booking')::uuid and checked_out_at is not null and checked_out_by=auth.uid()) then raise exception 'Checkout actor/time missing'; end if;
 if not exists(select 1 from public.reservation_activity where reservation_id=current_setting('billing.test.booking')::uuid and action='CHECKED_OUT') then raise exception 'Checkout audit missing'; end if;
 perform public.record_payment(f,request_id,200000,'CASH','');
 begin
 perform public.record_payment(f,gen_random_uuid(),1,'CASH','');
 raise exception 'Closed folio payment accepted';
 exception when raise_exception then if sqlerrm<>'FOLIO_CLOSED' then raise; end if; end;
 begin
 perform public.check_out_reservation(f,v);
 raise exception 'Duplicate checkout accepted';
 exception when raise_exception then if sqlerrm<>'FOLIO_CLOSED' then raise; end if; end;
end; $$;
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000001',true);
do $$ begin
 begin
 perform public.reverse_payment('60000000-0000-4000-8000-000000000051','Closed correction');
 raise exception 'Closed bill reversed';
 exception when raise_exception then if sqlerrm<>'FOLIO_CLOSED' then raise; end if; end;
end; $$;
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000004',true);
do $$ begin
 if exists(select 1 from public.folios) or exists(select 1 from public.payments) then raise exception 'Housekeeping read financial data'; end if;
 begin
 perform public.record_payment(current_setting('billing.test.folio')::uuid,gen_random_uuid(),1,'CASH','');
 raise exception 'Housekeeping payment accepted';
 exception when insufficient_privilege then null; end;
 update public.rooms set status='CLEANING' where room_number='BILL-1';
 update public.rooms set status='CLEAN' where room_number='BILL-1';
 update public.rooms set status='INSPECTED' where room_number='BILL-1';
 update public.rooms set status='AVAILABLE' where room_number='BILL-1';
 if not exists(select 1 from public.rooms where room_number='BILL-1' and status='AVAILABLE') then raise exception 'Cleaning after checkout failed'; end if;
end; $$;
reset role;
-- Keep a second owner while testing inactive-account denial.
insert into auth.users(id,email) values('60000000-0000-4000-8000-000000000099','backup-owner@billing.invalid');
update public.profiles set role='OWNER',is_active=true where email='backup-owner@billing.invalid';
update public.profiles set is_active=false where email='owner@billing.invalid';
set local role authenticated;
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000001',true);
do $$ begin
 if exists(select 1 from public.folios) then raise exception 'Inactive staff read bills'; end if;
 begin
 perform public.check_out_reservation(current_setting('billing.test.folio')::uuid,1);
 raise exception 'Inactive checkout accepted';
 exception when insufficient_privilege then null; end;
end; $$;
reset role;
set local role anon;
do $$ begin
 begin
 perform 1 from public.payments;
 raise exception 'Anonymous read payments';
 exception when insufficient_privilege then null; end;
 begin
 perform public.record_payment(current_setting('billing.test.folio')::uuid,gen_random_uuid(),1,'CASH','');
 raise exception 'Anonymous payment accepted';
 exception when insufficient_privilege then null; end;
end; $$;
reset role;

-- Dashboard integration uses these real booking, checkout and payment fixtures.
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000099',true);
set local role authenticated;
do $$
declare d jsonb; expected numeric; actual numeric;
begin
 d:=public.dashboard_summary();
 if (d->>'date')::date<>(now() at time zone 'Asia/Jakarta')::date then raise exception 'Dashboard date incorrect'; end if;
 if (d->'rooms'->>'active')::int<>(select count(*) from public.rooms where is_active) then raise exception 'Dashboard room count incorrect'; end if;
 if not(d ? 'bookings' and d ? 'payments' and d ? 'housekeeping') then raise exception 'Owner dashboard incomplete'; end if;
 select coalesce(sum(case when kind='PAYMENT' then amount else -amount end),0) into expected from public.payments;
 select coalesce(sum((value->>'net')::numeric),0) into actual from jsonb_array_elements(d->'payments');
 if expected<>actual then raise exception 'Dashboard net ignores reversals'; end if;
end; $$;
reset role;
-- Move every receipt out of the window, then place reversals exactly at midnight.
update public.payments set created_at=((now() at time zone 'Asia/Jakarta')::date+1)::timestamp at time zone 'Asia/Jakarta';
update public.payments set created_at=(now() at time zone 'Asia/Jakarta')::date::timestamp at time zone 'Asia/Jakarta' where kind='REVERSAL';
set local role authenticated;
do $$
declare d jsonb; actual numeric; expected numeric;
begin
 d:=public.dashboard_summary();
 select coalesce(sum((value->>'net')::numeric),0) into actual from jsonb_array_elements(d->'payments');
 select -coalesce(sum(amount),0) into expected from public.payments where kind='REVERSAL';
 if expected>=0 or actual<>expected then raise exception 'Jakarta midnight boundary or negative net incorrect'; end if;
end; $$;
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000004',true);
do $$ declare d jsonb; begin
 d:=public.dashboard_summary();
 if d ? 'payments' or d ? 'bookings' or not(d ? 'rooms') then raise exception 'Housekeeping dashboard access incorrect'; end if;
end; $$;
reset role;
update public.profiles set role='FINANCE' where id='60000000-0000-4000-8000-000000000004';
set local role authenticated;
do $$ declare d jsonb; begin
 d:=public.dashboard_summary();
 if d ? 'rooms' or d ? 'bookings' or d ? 'housekeeping' or not(d ? 'payments') then raise exception 'Finance dashboard access incorrect'; end if;
end; $$;
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000001',true);
do $$ begin
 begin perform public.dashboard_summary(); raise exception 'Inactive dashboard allowed'; exception when insufficient_privilege then null; end;
end; $$;
reset role;
set local role anon;
do $$ begin
 begin perform public.dashboard_summary(); raise exception 'Anonymous dashboard allowed'; exception when insufficient_privilege then null; end;
end; $$;
reset role;


-- Payment report follows entry dates, including reversals of earlier receipts.
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000099',true);
set local role authenticated;
do $$ declare d jsonb; day date:=(now() at time zone 'Asia/Jakarta')::date; expected numeric; actual numeric; begin
 d:=public.payment_report(day,day);
 select -coalesce(sum(amount),0) into expected from public.payments where kind='REVERSAL';
 select coalesce(sum((value->>'net')::numeric),0) into actual from jsonb_array_elements(d->'totals');
 if expected>=0 or actual<>expected then raise exception 'Report midnight/reversal total incorrect'; end if;
 select coalesce(sum((value->>'net')::numeric),0) into actual from jsonb_array_elements(d->'methods');
 if actual<>expected then raise exception 'Report method total incorrect'; end if;
 d:=public.payment_report(day+1,day+1);
 select coalesce(sum(amount),0) into expected from public.payments where kind='PAYMENT';
 select coalesce(sum((value->>'net')::numeric),0) into actual from jsonb_array_elements(d->'totals');
 if actual<>expected then raise exception 'Report next-day receipts incorrect'; end if;
 if jsonb_array_length(public.payment_report(day-2,day-1)->'totals')<>0 then raise exception 'Empty report not empty'; end if;
 begin perform public.payment_report(day,day-1);raise exception 'Reversed dates allowed';exception when raise_exception then if sqlerrm<>'INVALID_REPORT_DATES' then raise;end if;end;
 begin perform public.payment_report(day,day+366);raise exception 'Long dates allowed';exception when raise_exception then if sqlerrm<>'INVALID_REPORT_DATES' then raise;end if;end;
 perform set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000004',true);
 -- This fixture was changed to FINANCE by the dashboard checks.
 if public.payment_report(day,day) is null then raise exception 'Finance denied report';end if;
 perform set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000003',true);
 begin perform public.payment_report(day,day);raise exception 'Front office report allowed';exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000001',true);
 begin perform public.payment_report(day,day);raise exception 'Inactive report allowed';exception when insufficient_privilege then null;end;
end;$$;
reset role;set local role anon;
do $$ begin begin perform public.payment_report(current_date,current_date);raise exception 'Anon report allowed';exception when insufficient_privilege then null;end;end;$$;
reset role;

rollback;
select 'Billing and checkout checks passed; fixtures rolled back.' as result;
