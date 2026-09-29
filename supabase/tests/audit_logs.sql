-- Disposable database only; fixtures roll back.
begin;
insert into auth.users(id,email) values
('c0000000-0000-4000-8000-000000000001','owner@audit.invalid'),
('c0000000-0000-4000-8000-000000000002','manager@audit.invalid'),
('c0000000-0000-4000-8000-000000000003','front@audit.invalid');
update public.profiles set is_active=true,role=case
 when email='owner@audit.invalid' then 'OWNER'::public.staff_role
 when email='manager@audit.invalid' then 'MANAGER'::public.staff_role
 else 'FRONT_OFFICE'::public.staff_role end where email like '%@audit.invalid';
insert into public.room_types(id,name,base_price,capacity,bed_type)
values('c0000000-0000-4000-8000-000000000010','Audit type',100,2,'Twin');
insert into public.rooms(id,room_number,room_type_id)
values('c0000000-0000-4000-8000-000000000011','AUD-1','c0000000-0000-4000-8000-000000000010');

set local role authenticated;
select set_config('request.jwt.claim.sub','c0000000-0000-4000-8000-000000000001',true);
do $$
declare day date:=(now() at time zone 'Asia/Jakarta')::date; task uuid; result jsonb;
begin
 insert into public.guests(full_name,notes) values('Audit guest','SECRET_GUEST_NOTE');
 update public.hotel_settings set phone='+62 123';
 task:=public.create_maintenance(gen_random_uuid(),'c0000000-0000-4000-8000-000000000011','Leaking tap','SECRET_MAINTENANCE_NOTE','NORMAL');
 perform public.record_expense(gen_random_uuid(),day,'REPAIRS',100,'IDR','BANK_TRANSFER','SECRET_EXPENSE_DESCRIPTION','SECRET-BANK-REF');

 result:=public.audit_log(day,day,'all',null,0,50);
 if (result->>'total')::integer<4 then raise exception 'Combined audit events missing'; end if;
 if result::text like '%SECRET_GUEST_NOTE%' or result::text like '%SECRET_MAINTENANCE_NOTE%'
 or result::text like '%SECRET_EXPENSE_DESCRIPTION%' or result::text like '%SECRET-BANK-REF%'
 then raise exception 'Audit log leaked sensitive details'; end if;
 if not exists(select 1 from jsonb_array_elements(result->'entries') e where e->>'module'='settings' and e->>'actor_id'=auth.uid()::text)
 then raise exception 'Settings event or actor missing'; end if;
 if not exists(select 1 from jsonb_array_elements(result->'entries') e where e->>'module'='maintenance' and e->>'entity_id'=task::text)
 then raise exception 'Maintenance event missing'; end if;

 result:=public.audit_log(day,day,'expenses',auth.uid(),0,1);
 if (result->>'total')::integer<>1 or jsonb_array_length(result->'entries')<>1
 or result->'entries'->0->>'module'<>'expenses' then raise exception 'Module/actor/page filter incorrect'; end if;
 begin perform public.audit_log(day,day,'unknown',null,0,50); raise exception 'Invalid module accepted';
 exception when raise_exception then if sqlerrm<>'INVALID_FILTER' then raise; end if; end;

 perform set_config('request.jwt.claim.sub','c0000000-0000-4000-8000-000000000002',true);
 if public.audit_log(day,day,'all',null,0,50) is null then raise exception 'Manager denied audit'; end if;
 perform set_config('request.jwt.claim.sub','c0000000-0000-4000-8000-000000000003',true);
 begin perform public.audit_log(day,day,'all',null,0,50); raise exception 'Front office read audit';
 exception when insufficient_privilege then null; end;
end; $$;
reset role;
set local role anon;
do $$ begin
 begin perform public.audit_log(current_date,current_date,'all',null,0,50); raise exception 'Anonymous read audit';
 exception when insufficient_privilege then null; end;
end; $$;
reset role;
rollback;
select 'Audit log checks passed; fixtures rolled back.' as result;
