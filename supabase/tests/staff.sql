-- Disposable development database only. Fixtures and access changes roll back.
begin;
insert into auth.users(id,email,raw_user_meta_data) values
('90000000-0000-4000-8000-000000000001','owner1@staff.invalid','{}'),
('90000000-0000-4000-8000-000000000002','owner2@staff.invalid','{}'),
('90000000-0000-4000-8000-000000000003','manager@staff.invalid','{}'),
('90000000-0000-4000-8000-000000000004','cleaner@staff.invalid','{"role":"OWNER","is_active":true}'),
('90000000-0000-4000-8000-000000000005','inactive@staff.invalid','{}');
do $$ begin
 if not exists(select 1 from public.profiles where email='cleaner@staff.invalid' and role='FRONT_OFFICE' and not is_active and version=1)
 then raise exception 'Auth metadata assigned access'; end if;
end; $$;
update public.profiles set role='OWNER',is_active=true where email in ('owner1@staff.invalid','owner2@staff.invalid');
-- Isolate last-owner checks from any existing development owner.
update public.profiles set is_active=false where role='OWNER' and is_active and id not in
 ('90000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000002');
update public.profiles set role='MANAGER',is_active=true where email='manager@staff.invalid';
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000001',true);
do $$ declare v integer; begin
 perform public.update_staff_profile('90000000-0000-4000-8000-000000000004',1,'Test cleaner','081234567890','HOUSEKEEPING',true);
 if not exists(select 1 from public.profiles where email='cleaner@staff.invalid' and role='HOUSEKEEPING' and is_active and version=2) then raise exception 'Owner cannot configure staff'; end if;
 if not exists(select 1 from public.housekeeping_staff() where id='90000000-0000-4000-8000-000000000004') then raise exception 'Cleaner missing from assignments'; end if;
 if not exists(select 1 from public.staff_activity where profile_id='90000000-0000-4000-8000-000000000004' and user_id=auth.uid() and action='UPDATE' and changed_fields @> array['role','is_active']) then raise exception 'Staff audit missing'; end if;
 begin
 perform public.update_staff_profile('90000000-0000-4000-8000-000000000004',1,'Old tab','','FINANCE',true);
 raise exception 'Stale staff edit accepted';
 exception when raise_exception then if sqlerrm<>'STALE_STAFF' then raise; end if; end;
 begin
 update public.profiles set version=999 where email='cleaner@staff.invalid';
 raise exception 'Client changed version';
 exception when insufficient_privilege then null; end;
 begin
 perform 1 from public.staff_owner_guard;
 raise exception 'Owner read private counter';
 exception when insufficient_privilege then null; end;
 select version into v from public.profiles where email='owner2@staff.invalid';
 perform public.update_staff_profile('90000000-0000-4000-8000-000000000002',v,'Second owner','','MANAGER',true);
 select version into v from public.profiles where id=auth.uid();
 begin
 perform public.update_staff_profile(auth.uid(),v,'Only owner','','FRONT_OFFICE',true);
 raise exception 'Last owner demoted';
 exception when raise_exception then if sqlerrm<>'LAST_ACTIVE_OWNER' then raise; end if; end;
 begin
 perform public.update_staff_profile(auth.uid(),v,'Only owner','','OWNER',false);
 raise exception 'Last owner deactivated';
 exception when raise_exception then if sqlerrm<>'LAST_ACTIVE_OWNER' then raise; end if; end;
end; $$;
reset role;
do $$ begin
 begin
 update public.profiles set is_active=false where email='owner1@staff.invalid';
 raise exception 'Direct update bypassed last-owner guard';
 exception when raise_exception then if sqlerrm<>'LAST_ACTIVE_OWNER' then raise; end if; end;
 begin
 delete from auth.users where email='owner1@staff.invalid';
 raise exception 'Auth deletion bypassed last-owner guard';
 exception when raise_exception then if sqlerrm<>'LAST_ACTIVE_OWNER' then raise; end if; end;
 if (select active_owners from public.staff_owner_guard)<>(select count(*) from public.profiles where is_active and role='OWNER') then raise exception 'Owner counter diverged'; end if;
end; $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000003',true);
do $$ declare affected integer; begin
 if (select count(*) from public.profiles where email like '%@staff.invalid')<>5 then raise exception 'Manager cannot read staff'; end if;
 if not exists(select 1 from public.staff_activity) then raise exception 'Manager cannot read activity'; end if;
 begin
 perform public.update_staff_profile('90000000-0000-4000-8000-000000000004',2,'Forbidden','','OWNER',true);
 raise exception 'Manager configured roles';
 exception when insufficient_privilege then null; end;
 update public.profiles set role='OWNER' where id=auth.uid();
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Manager bypassed RPC'; end if;
end; $$;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000004',true);
do $$ begin
 if exists(select 1 from public.staff_activity) then raise exception 'Housekeeping read staff audit'; end if;
 begin
 perform public.update_staff_profile(auth.uid(),2,'Forbidden','','OWNER',true);
 raise exception 'Cleaner escalated role';
 exception when insufficient_privilege then null; end;
end; $$;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000005',true);
do $$ begin
 begin
 perform public.update_staff_profile(auth.uid(),1,'Inactive','','OWNER',true);
 raise exception 'Inactive staff activated itself';
 exception when insufficient_privilege then null; end;
end; $$;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000001',true);
do $$ declare v integer; begin
 perform public.update_staff_profile('90000000-0000-4000-8000-000000000004',2,'Test cleaner','','HOUSEKEEPING',false);
 if exists(select 1 from public.housekeeping_staff() where id='90000000-0000-4000-8000-000000000004') then raise exception 'Inactive cleaner assignable'; end if;
 select version into v from public.profiles where email='owner2@staff.invalid';
 perform public.update_staff_profile('90000000-0000-4000-8000-000000000002',v,'Replacement owner','','OWNER',true);
 select version into v from public.profiles where id=auth.uid();
 perform public.update_staff_profile(auth.uid(),v,'Former owner','','OWNER',false);
end; $$;
do $$ begin
 if public.current_staff_role() is not null then raise exception 'Deactivated owner still has role'; end if;
 begin
 perform public.update_staff_profile('90000000-0000-4000-8000-000000000004',3,'Denied','','OWNER',true);
 raise exception 'Deactivated owner retained authority';
 exception when insufficient_privilege then null; end;
end; $$;
reset role;
do $$ begin
 if (select active_owners from public.staff_owner_guard)<>1 then raise exception 'Replacement owner count incorrect'; end if;
end; $$;
set local role anon;
do $$ begin
 begin
 perform public.update_staff_profile('90000000-0000-4000-8000-000000000004',3,'Anonymous','','OWNER',true);
 raise exception 'Anonymous staff write accepted';
 exception when insufficient_privilege then null; end;
 begin
 perform 1 from public.staff_activity;
 raise exception 'Anonymous read staff history';
 exception when insufficient_privilege then null; end;
end; $$;
reset role;
rollback;
select 'Staff management checks passed; fixtures rolled back.' as result;
