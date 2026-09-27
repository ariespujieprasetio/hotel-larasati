begin;
insert into auth.users(id,email) values('90000000-0000-4000-8000-000000000001','manager@settings.invalid'),('90000000-0000-4000-8000-000000000002','front@settings.invalid');
update public.profiles set is_active=true,role=case when email='manager@settings.invalid' then 'MANAGER'::public.staff_role else 'FRONT_OFFICE'::public.staff_role end where email like '%@settings.invalid';
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000001',true);
do $$ declare v integer; affected integer; begin
 select version into v from public.hotel_settings;
 update public.hotel_settings set hotel_name='Updated hotel',tax_percentage=11,service_charge_percentage=5 where version=v;
 get diagnostics affected=row_count;
 if affected<>1 or (select version from public.hotel_settings)<>v+1 then raise exception 'Settings update or version failed'; end if;
 update public.hotel_settings set hotel_name='Stale hotel' where version=v;
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Stale settings overwrote newer values'; end if;
 begin update public.hotel_settings set version=1; raise exception 'Client changed version'; exception when insufficient_privilege then null; end;
end; $$;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000002',true);
do $$ declare affected integer; begin
 update public.hotel_settings set hotel_name='Unauthorized';get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Front office changed settings'; end if;
end; $$;
reset role;rollback;
