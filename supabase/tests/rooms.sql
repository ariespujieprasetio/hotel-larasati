-- Development database only. Run the WHOLE script as postgres after both migrations.
begin;
insert into auth.users(id,email,raw_user_meta_data) values
('20000000-0000-4000-8000-000000000001','manager@rooms.invalid','{}'),
('20000000-0000-4000-8000-000000000002','cleaner@rooms.invalid','{}'),
('20000000-0000-4000-8000-000000000003','front@rooms.invalid','{}'),
('20000000-0000-4000-8000-000000000004','finance@rooms.invalid','{}');
update public.profiles set is_active=true,role=case id
when '20000000-0000-4000-8000-000000000001' then 'MANAGER'::public.staff_role
when '20000000-0000-4000-8000-000000000002' then 'HOUSEKEEPING'::public.staff_role
when '20000000-0000-4000-8000-000000000003' then 'FRONT_OFFICE'::public.staff_role
else 'FINANCE'::public.staff_role end where email like '%@rooms.invalid';
set local role authenticated;
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000001',true);
insert into public.room_types(name,base_price,capacity,bed_type) values('RLS test type',100000,2,'Twin');
insert into public.rooms(room_number,room_type_id) select 'RLS-101',id from public.room_types where name='RLS test type';
do $$
declare affected integer;
begin
 begin
 insert into public.rooms(room_number,room_type_id) select 'rls-101',id from public.room_types where name='RLS test type';
 raise exception 'Duplicate room accepted';
 exception when unique_violation then null; end;
 begin
 update public.room_types set is_active=false where name='RLS test type';
 raise exception 'Active type deactivated';
 exception when raise_exception then if sqlerrm<>'ROOM_TYPE_IN_USE' then raise; end if; end;
 begin
 update public.rooms set status='OCCUPIED' where room_number='RLS-101';
 raise exception 'Manual occupancy accepted';
 exception when raise_exception then if sqlerrm<>'ROOM_STAY_MANAGED' then raise; end if; end;
 update public.rooms set status='DIRTY' where room_number='RLS-101' and version=1;
 get diagnostics affected=row_count;
 if affected<>1 then raise exception 'Manager update failed'; end if;
 update public.rooms set notes='stale' where room_number='RLS-101' and version=1;
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Stale update accepted'; end if;
 if not exists(select 1 from public.room_activity where new_data->>'room_number'='RLS-101' and action='UPDATE' and user_id=auth.uid()) then raise exception 'Audit missing'; end if;
end; $$;
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000002',true);
do $$
begin
 begin
 update public.rooms set status='AVAILABLE' where room_number='RLS-101';
 raise exception 'Cleaning sequence bypassed';
 exception when raise_exception then if sqlerrm<>'ROOM_INVALID_TRANSITION' then raise; end if; end;
 begin
 update public.rooms set notes='forbidden' where room_number='RLS-101';
 raise exception 'Housekeeping edited metadata';
 exception when insufficient_privilege then null; end;
 update public.rooms set status='CLEANING' where room_number='RLS-101';
 update public.rooms set status='CLEAN' where room_number='RLS-101';
 update public.rooms set status='INSPECTED' where room_number='RLS-101';
 update public.rooms set status='AVAILABLE' where room_number='RLS-101';
 if not exists(select 1 from public.rooms where room_number='RLS-101' and status='AVAILABLE' and version=6) then raise exception 'Cleaning workflow failed'; end if;
 begin
 delete from public.room_activity;
 raise exception 'Audit deletion allowed';
 exception when insufficient_privilege then null; end;
end; $$;
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000003',true);
do $$
declare affected integer;
begin
 if not exists(select 1 from public.rooms where room_number='RLS-101') then raise exception 'Front office cannot read'; end if;
 update public.rooms set status='DIRTY' where room_number='RLS-101';
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Front office modified inventory'; end if;
end; $$;
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000004',true);
do $$ begin
 if exists(select 1 from public.rooms) then raise exception 'Finance accessed room operations'; end if;
end; $$;
reset role;
rollback;
select 'Room permission checks passed; fixtures rolled back.' as result;
