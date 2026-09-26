-- Run only against a disposable development Supabase instance as postgres.
-- All fixtures and updates are rolled back, including Auth users.
begin;

insert into auth.users (id, email, raw_user_meta_data)
values
('10000000-0000-0000-0000-000000000001', 'owner@phase1.invalid', '{"full_name":"Test owner"}'),
('10000000-0000-0000-0000-000000000002', 'manager@phase1.invalid', '{"full_name":"Test manager"}'),
('10000000-0000-0000-0000-000000000003', 'front@phase1.invalid', '{"full_name":"Test front office"}'),
('10000000-0000-0000-0000-000000000004', 'housekeeping@phase1.invalid', '{"full_name":"Test housekeeping"}'),
('10000000-0000-0000-0000-000000000005', 'finance@phase1.invalid', '{"full_name":"Test finance"}'),
('10000000-0000-0000-0000-000000000006', 'inactive@phase1.invalid', '{"full_name":"Test inactive","role":"OWNER","is_active":true}');

do $$
begin
  if not exists (
    select 1 from public.profiles
    where id = '10000000-0000-0000-0000-000000000006'
    and role = 'FRONT_OFFICE' and not is_active
  ) then raise exception 'Auth metadata granted privileges'; end if;
end;
$$;
update public.profiles set role = 'OWNER', is_active = true where id = '10000000-0000-0000-0000-000000000001';
update public.profiles set role = 'MANAGER', is_active = true where id = '10000000-0000-0000-0000-000000000002';
update public.profiles set role = 'FRONT_OFFICE', is_active = true where id = '10000000-0000-0000-0000-000000000003';
update public.profiles set role = 'HOUSEKEEPING', is_active = true where id = '10000000-0000-0000-0000-000000000004';
update public.profiles set role = 'FINANCE', is_active = true where id = '10000000-0000-0000-0000-000000000005';

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
do $$
declare affected integer;
begin
  if public.current_staff_role() <> 'OWNER' then raise exception 'Owner role lookup failed'; end if;
  update public.profiles set full_name = 'Updated by owner'
    where id = '10000000-0000-0000-0000-000000000003';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Owner cannot manage staff'; end if;
  update public.hotel_settings set hotel_name = 'Phase 1 test hotel';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Owner cannot update settings'; end if;
  begin
    update public.profiles set email = 'forged@phase1.invalid'
      where id = '10000000-0000-0000-0000-000000000003';
    raise exception 'Auth-owned email was mutable';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
do $$
declare affected integer;
begin
  if (select count(*) from public.profiles where email like '%@phase1.invalid') <> 6 then
    raise exception 'Manager cannot read staff'; end if;
  update public.hotel_settings set hotel_name = 'Manager test update';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Manager cannot update settings'; end if;
  update public.profiles set role = 'OWNER' where id = auth.uid();
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Manager escalated privileges'; end if;
end;
$$;

-- Each operational role can read settings and only their own profile;
-- direct role escalation and configuration writes must affect no rows.
do $$
declare staff_id text; affected integer;
begin
  foreach staff_id in array array[
    '10000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000005'
  ] loop
    perform set_config('request.jwt.claim.sub', staff_id, true);
    if (select count(*) from public.hotel_settings) <> 1 then raise exception 'Active staff cannot read settings'; end if;
    if (select count(*) from public.profiles) <> 1 then raise exception 'Operational staff can read other profiles'; end if;
    update public.profiles set role = 'OWNER' where id = auth.uid();
    get diagnostics affected = row_count;
    if affected <> 0 then raise exception 'Staff escalated privileges'; end if;
    update public.hotel_settings set tax_percentage = 99;
    get diagnostics affected = row_count;
    if affected <> 0 then raise exception 'Staff changed hotel settings'; end if;
    begin
      delete from public.hotel_settings;
      raise exception 'Staff deleted hotel settings';
    exception when insufficient_privilege then null;
    end;
  end loop;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000006', true);
do $$
declare affected integer;
begin
  if public.current_staff_role() is not null then raise exception 'Inactive staff got a role'; end if;
  if (select count(*) from public.hotel_settings) <> 0 then raise exception 'Inactive staff can read settings'; end if;
  if (select count(*) from public.profiles) <> 1 then raise exception 'Inactive staff profile access incorrect'; end if;
  update public.profiles set is_active = true where id = auth.uid();
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Inactive staff activated itself'; end if;
end;
$$;

reset role;
update auth.users set email = 'changed@phase1.invalid' where id = '10000000-0000-0000-0000-000000000006';
do $$
begin
  if not exists (select 1 from public.profiles where id = '10000000-0000-0000-0000-000000000006' and email = 'changed@phase1.invalid')
    then raise exception 'Auth email did not sync'; end if;
  begin
    update public.hotel_settings set tax_percentage = -1;
    raise exception 'Negative tax accepted';
  exception when check_violation then null;
  end;
  begin
    insert into public.hotel_settings (id) values ('20000000-0000-0000-0000-000000000001');
    raise exception 'Multiple hotel settings rows accepted';
  exception when check_violation then null;
  end;
end;
$$;

set local role anon;
do $$
begin
  begin
    perform 1 from public.hotel_settings;
    raise exception 'Anonymous settings access allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    perform 1 from public.profiles;
    raise exception 'Anonymous profile access allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
rollback;
select 'Phase 1 permission checks passed; fixtures rolled back.' as result;

