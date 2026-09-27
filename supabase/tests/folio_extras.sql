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

do $$
declare f public.folios; extra uuid:=gen_random_uuid(); second uuid:=gen_random_uuid(); payment uuid:=gen_random_uuid();
begin
 select * into f from public.folios where id=current_setting('billing.test.folio')::uuid;
 perform public.add_folio_extra(f.id,extra,f.version,'Laundry',2,12500.25);
 perform public.add_folio_extra(f.id,extra,f.version,'Laundry',2,12500.25);
 if (select total_amount from public.folios where id=f.id)<>225000.50 or (select count(*) from public.folio_extras where id=extra)<>1 then raise exception 'Extra total or idempotency failed'; end if;
 begin perform public.add_folio_extra(f.id,extra,f.version,'Laundry',3,12500.25); raise exception 'Request conflict allowed'; exception when raise_exception then if sqlerrm<>'EXTRA_REQUEST_CONFLICT' then raise; end if; end;
 begin perform public.add_folio_extra(f.id,second,f.version,'Minibar',1,100); raise exception 'Stale extra allowed'; exception when raise_exception then if sqlerrm<>'STALE_FOLIO' then raise; end if; end;
 begin perform public.add_folio_extra(f.id,second,f.version,'Minibar',1,0.001); raise exception 'Subcent allowed'; exception when raise_exception then if sqlerrm<>'INVALID_EXTRA' then raise; end if; end;
 begin perform public.add_folio_extra(f.id,second,f.version,'Minibar',1000,999999999999.99); raise exception 'Overflow allowed'; exception when raise_exception then if sqlerrm<>'AMOUNT_TOO_LARGE' then raise; end if; end;
 begin delete from public.folio_extras where id=extra; raise exception 'Extra deletion allowed'; exception when insufficient_privilege then null; end;
 begin update public.folio_extras set unit_price=1 where id=extra; raise exception 'Extra edit allowed'; exception when insufficient_privilege then null; end;
 perform public.record_payment(f.id,payment,225000.50,'CASH','');
 select * into f from public.folios where id=f.id;
 begin perform public.void_folio_extra(extra,f.version,'Incorrect charge'); raise exception 'Negative balance allowed'; exception when raise_exception then if sqlerrm<>'EXTRA_ALREADY_PAID' then raise; end if; end;
 perform public.reverse_payment(payment,'Incorrect receipt');
 select * into f from public.folios where id=f.id;
 perform public.void_folio_extra(extra,f.version,'Duplicate laundry');
 perform public.void_folio_extra(extra,f.version,'Duplicate laundry');
 if (select total_amount from public.folios where id=f.id)<>200000 or not exists(select 1 from public.folio_extras where id=extra and voided_by=auth.uid() and void_reason='Duplicate laundry') then raise exception 'Cancellation audit or total failed'; end if;
 select * into f from public.folios where id=f.id;
 -- Finance can add, but cannot cancel; all billing roles may read history.
 perform set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000002',true);
 perform public.add_folio_extra(f.id,second,f.version,'Minibar',1,100);
 begin perform public.void_folio_extra(second,f.version+1,'Wrong item'); raise exception 'Finance cancellation allowed'; exception when insufficient_privilege then null; end;
 perform set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000004',true);
 if exists(select 1 from public.folio_extras) then raise exception 'Housekeeping read extras'; end if;
 begin perform public.add_folio_extra(f.id,gen_random_uuid(),f.version,'Item',1,100); raise exception 'Housekeeping charge allowed'; exception when insufficient_privilege then null; end;
 perform set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000003',true);
 select * into f from public.folios where id=f.id;
 perform public.add_folio_extra(f.id,gen_random_uuid(),f.version,'Extra bed',1,200);
 begin perform public.void_folio_extra(second,f.version,'Wrong item'); raise exception 'Front office cancellation allowed'; exception when insufficient_privilege then null; end;
 begin perform public.check_out_reservation(f.id,f.version); raise exception 'Old checkout allowed'; exception when raise_exception then if sqlerrm<>'STALE_FOLIO' then raise; end if; end;
 select * into f from public.folios where id=f.id;
 begin perform public.check_out_reservation(f.id,f.version); raise exception 'Unpaid extras checkout allowed'; exception when raise_exception then if sqlerrm<>'BALANCE_DUE' then raise; end if; end;
 perform public.record_payment(f.id,gen_random_uuid(),f.balance,'CASH','');
 select * into f from public.folios where id=f.id;
 perform public.check_out_reservation(f.id,f.version);
 begin perform public.add_folio_extra(f.id,gen_random_uuid(),f.version,'Late item',1,100); raise exception 'Closed extra allowed'; exception when raise_exception then if sqlerrm<>'FOLIO_CLOSED' then raise; end if; end;
 perform set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000001',true);
 begin perform public.void_folio_extra(second,f.version,'Wrong item'); raise exception 'Closed cancellation allowed'; exception when raise_exception then if sqlerrm<>'FOLIO_CLOSED' then raise; end if; end;
end; $$;
reset role;
update public.profiles set is_active=false where email='finance@billing.invalid';
set local role authenticated;
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000002',true);
do $$ begin
 if exists(select 1 from public.folio_extras) then raise exception 'Inactive read extras'; end if;
 begin perform public.add_folio_extra(gen_random_uuid(),gen_random_uuid(),1,'Item',1,1); raise exception 'Inactive charge allowed'; exception when insufficient_privilege then null; end;
end; $$;
reset role; set local role anon;
do $$ begin
 begin perform public.add_folio_extra(gen_random_uuid(),gen_random_uuid(),1,'Item',1,1); raise exception 'Anon charge allowed'; exception when insufficient_privilege then null; end;
end; $$;
reset role;
rollback;
