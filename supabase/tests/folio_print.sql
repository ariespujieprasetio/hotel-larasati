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
declare f public.folios; d jsonb; i integer; item uuid; first_item uuid;
begin
 select * into f from public.folios where id=current_setting('billing.test.folio')::uuid;
 for i in 1..205 loop
 select * into f from public.folios where id=f.id;
 item:=public.add_folio_extra(f.id,gen_random_uuid(),f.version,'Service '||i,1,1);
 if i=1 then first_item:=item; end if;
 perform public.record_payment(f.id,gen_random_uuid(),1,'CASH','');
 end loop;
 select * into f from public.folios where id=f.id;
 perform public.void_folio_extra(first_item,f.version,'Internal correction');
 d:=public.folio_print(f.id);
 if jsonb_array_length(d->'extras')<>204 or jsonb_array_length(d->'payments')<>205 then raise exception 'Print rows truncated'; end if;
 if (d->'folio'->>'total_amount')::numeric<>200204 or (d->'folio'->>'paid_amount')::numeric<>205 or (d->'folio'->>'balance')::numeric<>199999 then raise exception 'Print totals wrong'; end if;
 if d::text like '%Internal correction%' or d::text like '%created_by%' or d::text like '%id_number%' then raise exception 'Print leaks internal data'; end if;
 if public.folio_print(gen_random_uuid()) is not null then raise exception 'Missing folio not null'; end if;
 perform set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000002',true);
 if public.folio_print(f.id)->>'arrival' is null then raise exception 'Finance cannot print dates'; end if;
 if exists(select 1 from public.reservations) then raise exception 'Finance gained reservation access'; end if;
 perform set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000003',true);
 if public.folio_print(f.id) is null then raise exception 'Front office cannot print'; end if;
 perform set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000004',true);
 begin perform public.folio_print(f.id); raise exception 'Housekeeping printed bill'; exception when insufficient_privilege then null; end;
end; $$;
reset role;
update public.profiles set is_active=false where email='finance@billing.invalid';
set local role authenticated;
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000002',true);
do $$ begin
 begin perform public.folio_print(current_setting('billing.test.folio')::uuid); raise exception 'Inactive printed bill'; exception when insufficient_privilege then null; end;
end; $$;
reset role;set local role anon;
do $$ begin
 begin perform public.folio_print(current_setting('billing.test.folio')::uuid); raise exception 'Anon printed bill'; exception when insufficient_privilege then null; end;
end; $$;
reset role;rollback;
