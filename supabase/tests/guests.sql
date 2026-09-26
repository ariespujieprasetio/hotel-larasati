-- Disposable development database only, as postgres.
-- Run the WHOLE script after applying the guest migration.
begin;
insert into auth.users(id,email,raw_user_meta_data) values
('30000000-0000-4000-8000-000000000001','front@guests.invalid','{}'),
('30000000-0000-4000-8000-000000000002','housekeeping@guests.invalid','{}'),
('30000000-0000-4000-8000-000000000003','finance@guests.invalid','{}');
update public.profiles set is_active=true,role=case id
 when '30000000-0000-4000-8000-000000000001' then 'FRONT_OFFICE'::public.staff_role
 when '30000000-0000-4000-8000-000000000002' then 'HOUSEKEEPING'::public.staff_role
 else 'FINANCE'::public.staff_role end where email like '%@guests.invalid';
set local role authenticated;
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000001',true);
insert into public.guests(full_name,id_type,id_number) values('Guest RLS fixture','PASSPORT','TEST-GUEST-001');
do $$
declare affected integer;
begin
 if not exists(select 1 from public.guests where id_number='TEST-GUEST-001' and guest_code like 'GST-%' and version=1) then raise exception 'Guest creation failed'; end if;
 begin
  insert into public.guests(full_name,id_type,id_number) values('Duplicate','PASSPORT','test-guest-001');
  raise exception 'Duplicate identity accepted';
 exception when unique_violation then null; end;
 begin
  insert into public.guests(full_name,id_type,id_number) values('Invalid KTP','KTP','1234');
  raise exception 'Invalid KTP accepted';
 exception when check_violation then null; end;
 begin
  update public.guests set guest_code='FORGED' where id_number='TEST-GUEST-001';
  raise exception 'Guest code overwritten';
 exception when insufficient_privilege then null; end;
 update public.guests set notes='Test update' where id_number='TEST-GUEST-001' and version=1;
 get diagnostics affected=row_count;
 if affected<>1 then raise exception 'Guest update failed'; end if;
 update public.guests set notes='Stale overwrite' where id_number='TEST-GUEST-001' and version=1;
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Stale guest update accepted'; end if;
 if not exists(select 1 from public.guest_activity a join public.guests g on g.id=a.guest_id where g.id_number='TEST-GUEST-001' and a.action='UPDATE' and a.changed_fields=array['notes'] and a.user_id=auth.uid())
 then raise exception 'Guest audit missing'; end if;
 update public.guests set is_active=false where id_number='TEST-GUEST-001';
 if not exists(select 1 from public.guests where id_number='TEST-GUEST-001' and not is_active) then raise exception 'Guest deactivation failed'; end if;
 begin
  delete from public.guests where id_number='TEST-GUEST-001';
  raise exception 'Guest deletion allowed';
 exception when insufficient_privilege then null; end;
 begin
  delete from public.guest_activity;
  raise exception 'Audit deletion allowed';
 exception when insufficient_privilege then null; end;
end; $$;
do $$
declare staff_id text; affected integer;
begin
 foreach staff_id in array array['30000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000003'] loop
 perform set_config('request.jwt.claim.sub',staff_id,true);
 if exists(select 1 from public.guests) or exists(select 1 from public.guest_activity) then raise exception 'Unauthorized guest access'; end if;
 update public.guests set notes='forbidden';
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Unauthorized guest update'; end if;
 begin
  insert into public.guests(full_name) values('Forbidden guest');
  raise exception 'Unauthorized guest insert';
 exception when insufficient_privilege then null; end;
 end loop;
end; $$;
reset role;
update public.profiles set is_active=false where id='30000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000001',true);
do $$ begin
 if exists(select 1 from public.guests) then raise exception 'Inactive staff read guests'; end if;
end; $$;
reset role;
set local role anon;
do $$ begin
 begin perform 1 from public.guests; raise exception 'Anonymous read allowed';
 exception when insufficient_privilege then null; end;
end; $$;
reset role;
rollback;
-- Sequences may have gaps after rolled-back inserts; this is expected.
select 'Guest permission checks passed; fixtures rolled back.' as result;

