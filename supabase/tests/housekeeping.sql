-- Disposable development database only. Run the entire script as postgres.
begin;
insert into auth.users(id,email) values
('80000000-0000-4000-8000-000000000001','manager@hk.invalid'),
('80000000-0000-4000-8000-000000000002','cleaner1@hk.invalid'),
('80000000-0000-4000-8000-000000000003','cleaner2@hk.invalid'),
('80000000-0000-4000-8000-000000000004','front@hk.invalid'),
('80000000-0000-4000-8000-000000000005','finance@hk.invalid'),
('80000000-0000-4000-8000-000000000006','inactive@hk.invalid');
update public.profiles set is_active=(email<>'inactive@hk.invalid'),role=case
 when email='manager@hk.invalid' then 'MANAGER'::public.staff_role
 when email='front@hk.invalid' then 'FRONT_OFFICE'::public.staff_role
 when email='finance@hk.invalid' then 'FINANCE'::public.staff_role
 else 'HOUSEKEEPING'::public.staff_role end where email like '%@hk.invalid';
insert into public.room_types(id,name,base_price,capacity,bed_type) values('80000000-0000-4000-8000-000000000020','Housekeeping type',100000,2,'Twin');
insert into public.rooms(id,room_number,room_type_id) values
('80000000-0000-4000-8000-000000000030','HK-101','80000000-0000-4000-8000-000000000020'),
('80000000-0000-4000-8000-000000000031','HK-102','80000000-0000-4000-8000-000000000020');
set local role authenticated;
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000001',true);
do $$
declare task public.housekeeping_tasks;
begin
 update public.rooms set status='DIRTY' where room_number='HK-101';
 select * into task from public.housekeeping_tasks where room_number='HK-101' and closed_at is null;
 if not found or task.status<>'DIRTY' or task.assigned_to is not null then raise exception 'Dirty room task missing'; end if;
 perform set_config('hk.test.task',task.id::text,true);
 update public.rooms set notes='Room metadata change' where room_number='HK-101';
 if (select count(*) from public.housekeeping_tasks where room_id=task.room_id)<>1 then raise exception 'Duplicate tasks'; end if;
 if (select count(*) from public.housekeeping_staff() where id in ('80000000-0000-4000-8000-000000000002','80000000-0000-4000-8000-000000000003'))<>2 then raise exception 'Active staff directory incorrect'; end if;
 begin
 perform public.update_housekeeping_task(task.id,1,'ASSIGN','80000000-0000-4000-8000-000000000006','');
 raise exception 'Inactive assignee accepted';
 exception when raise_exception then if sqlerrm<>'ASSIGNEE_UNAVAILABLE' then raise; end if; end;
 begin
 perform public.update_housekeeping_task(task.id,1,'ASSIGN','80000000-0000-4000-8000-000000000004','');
 raise exception 'Front office assignee accepted';
 exception when raise_exception then if sqlerrm<>'ASSIGNEE_UNAVAILABLE' then raise; end if; end;
 perform public.update_housekeeping_task(task.id,1,'ASSIGN','80000000-0000-4000-8000-000000000002','Prepare for arrival');
 begin
 update public.housekeeping_tasks set assigned_to=null where id=task.id;
 raise exception 'Direct task update accepted';
 exception when insufficient_privilege then null; end;
end; $$;
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000003',true);
do $$ declare v_task uuid:=current_setting('hk.test.task')::uuid; begin
 begin
 perform public.update_housekeeping_task(v_task,2,'ADVANCE',null,'');
 raise exception 'Other cleaner advanced task';
 exception when insufficient_privilege then null; end;
 begin
 perform public.update_housekeeping_task(v_task,2,'ASSIGN',auth.uid(),'');
 raise exception 'Other cleaner stole task';
 exception when insufficient_privilege then null; end;
 begin
 update public.rooms set status='CLEANING' where room_number='HK-101';
 raise exception 'Room API bypassed assignment';
 exception when insufficient_privilege then null; end;
end; $$;
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000002',true);
do $$ declare v_task uuid:=current_setting('hk.test.task')::uuid; begin
 begin
 perform public.update_housekeeping_task(v_task,1,'ADVANCE',null,'');
 raise exception 'Stale task accepted';
 exception when raise_exception then if sqlerrm<>'STALE_TASK' then raise; end if; end;
 begin
 perform public.update_housekeeping_task(v_task,2,'ASSIGN',null,'');
 raise exception 'Cleaner unassigned task';
 exception when insufficient_privilege then null; end;
 perform public.update_housekeeping_task(v_task,2,'NOTE',null,'Fresh towels requested');
 if not exists(select 1 from public.housekeeping_activity where task_id=v_task and action='NOTE' and user_id=auth.uid() and note='Fresh towels requested') then raise exception 'Note audit missing'; end if;
 update public.rooms set status='CLEANING' where room_number='HK-101';
 if not exists(select 1 from public.housekeeping_tasks where housekeeping_tasks.id=v_task and status='CLEANING' and version=4) then raise exception 'Room change did not sync'; end if;
 perform public.update_housekeeping_task(v_task,4,'ADVANCE',null,'Bathroom and linen cleaned');
 perform public.update_housekeeping_task(v_task,5,'ADVANCE',null,'Inspection complete');
 perform public.update_housekeeping_task(v_task,6,'ADVANCE',null,'Ready');
 if not exists(select 1 from public.rooms where room_number='HK-101' and status='AVAILABLE') then raise exception 'Task did not update room'; end if;
 if not exists(select 1 from public.housekeeping_tasks where housekeeping_tasks.id=v_task and status='COMPLETED' and closed_at is not null) then raise exception 'Task not closed'; end if;
 begin
 perform public.update_housekeeping_task(v_task,7,'NOTE',null,'Late edit');
 raise exception 'Closed task edited';
 exception when raise_exception then if sqlerrm<>'TASK_CLOSED' then raise; end if; end;
end; $$;
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000001',true);
update public.rooms set status='DIRTY' where room_number='HK-101';
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000003',true);
do $$ declare task public.housekeeping_tasks; begin
 select * into task from public.housekeeping_tasks where room_number='HK-101' and closed_at is null;
 if task.id=current_setting('hk.test.task')::uuid then raise exception 'New cleaning reused closed task'; end if;
 perform public.update_housekeeping_task(task.id,1,'ADVANCE',null,'Starting unassigned job');
 if not exists(select 1 from public.housekeeping_tasks where id=task.id and assigned_to=auth.uid() and status='CLEANING') then raise exception 'Self claim failed'; end if;
end; $$;
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000001',true);
update public.rooms set status='MAINTENANCE' where room_number='HK-101';
do $$ begin
 if exists(select 1 from public.housekeeping_tasks where room_number='HK-101' and closed_at is null) or not exists(select 1 from public.housekeeping_tasks where room_number='HK-101' and status='CANCELLED') then raise exception 'Blocked room task not cancelled'; end if;
end; $$;
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000004',true);
do $$ begin
 if not exists(select 1 from public.housekeeping_tasks) then raise exception 'Front office cannot read progress'; end if;
 begin
 perform public.update_housekeeping_task(current_setting('hk.test.task')::uuid,7,'ADVANCE',null,'');
 raise exception 'Front office wrote task';
 exception when insufficient_privilege then null; end;
 begin
 perform * from public.housekeeping_staff();
 raise exception 'Front office read staff directory';
 exception when insufficient_privilege then null; end;
end; $$;
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000005',true);
do $$ begin
 if exists(select 1 from public.housekeeping_tasks) or exists(select 1 from public.housekeeping_activity) then raise exception 'Finance read housekeeping'; end if;
 begin
 perform public.update_housekeeping_task(current_setting('hk.test.task')::uuid,7,'NOTE',null,'forbidden');
 raise exception 'Finance wrote task';
 exception when insufficient_privilege then null; end;
end; $$;
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000006',true);
do $$ begin
 if exists(select 1 from public.housekeeping_tasks) then raise exception 'Inactive read housekeeping'; end if;
 begin
 perform * from public.housekeeping_staff();
 raise exception 'Inactive read staff directory';
 exception when insufficient_privilege then null; end;
end; $$;
reset role;
insert into public.guests(id,full_name) values('80000000-0000-4000-8000-000000000010','Housekeeping booking guest');
update public.hotel_settings set tax_percentage=0,service_charge_percentage=0,default_currency='IDR';
set local role authenticated;
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000001',true);
do $$ declare booking uuid; task_id uuid; folio_id uuid; today date:=(now() at time zone 'Asia/Jakarta')::date; begin
 update public.rooms set status='INSPECTED' where room_number='HK-102';
 select id into task_id from public.housekeeping_tasks where room_number='HK-102' and closed_at is null;
 booking:=public.save_reservation(jsonb_build_object('guest_id','80000000-0000-4000-8000-000000000010','room_type_id','80000000-0000-4000-8000-000000000020',
 'room_id','80000000-0000-4000-8000-000000000031','check_in_date',today,'check_out_date',today+1,'adults',1,'children',0,
 'discount_amount',100000,'source','DIRECT','status','CONFIRMED','expected_total',0,'expected_currency','IDR'));
 perform public.check_in_reservation(booking,1);
 if not exists(select 1 from public.housekeeping_tasks where id=task_id and status='COMPLETED') then raise exception 'Inspected room checkin left open task'; end if;
 select id into folio_id from public.folios where reservation_id=booking;
 perform public.check_out_reservation(folio_id,1);
 if not exists(select 1 from public.housekeeping_tasks where room_number='HK-102' and id<>task_id and status='DIRTY' and closed_at is null) then raise exception 'Checkout did not create cleaning job'; end if;
end; $$;

-- An imported INSPECTED job is also claimed when the cleaner completes it.
update public.rooms set status='INSPECTED' where room_number='HK-101';
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000003',true);
update public.rooms set status='AVAILABLE' where room_number='HK-101';
do $$ begin
 if not exists(select 1 from public.housekeeping_tasks where room_number='HK-101' and status='COMPLETED' and assigned_to=auth.uid())
 then raise exception 'Final cleaning step did not claim unassigned job'; end if;
end; $$;
reset role;
set local role anon;
do $$ begin
 begin
 perform 1 from public.housekeeping_tasks;
 raise exception 'Anonymous read tasks';
 exception when insufficient_privilege then null; end;
 begin
 perform public.update_housekeeping_task(current_setting('hk.test.task')::uuid,1,'ADVANCE',null,'');
 raise exception 'Anonymous wrote task';
 exception when insufficient_privilege then null; end;
end; $$;
reset role;
rollback;
select 'Housekeeping checks passed; fixtures rolled back.' as result;
