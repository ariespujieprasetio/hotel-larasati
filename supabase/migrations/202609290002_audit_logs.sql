begin;

create table public.hotel_settings_activity (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id) on delete set null,
 changed_fields text[] not null,
 created_at timestamptz not null default clock_timestamp()
);
alter table public.hotel_settings_activity enable row level security;
revoke all on public.hotel_settings_activity from public,anon,authenticated;

create function public.log_hotel_settings_activity() returns trigger
language plpgsql security definer set search_path='' as $$
declare fields text[];
begin
 select coalesce(array_agg(e.key order by e.key),'{}'::text[]) into fields
 from jsonb_each(to_jsonb(new)) e
 where e.key not in ('id','version','created_at','updated_at')
 and e.value is distinct from to_jsonb(old)->e.key;
 if cardinality(fields)>0 then
  insert into public.hotel_settings_activity(user_id,changed_fields)
  values(auth.uid(),fields);
 end if;
 return new;
end; $$;
revoke all on function public.log_hotel_settings_activity() from public,anon,authenticated;
create trigger hotel_settings_activity_log after update on public.hotel_settings
for each row execute function public.log_hotel_settings_activity();

create function public.audit_log(p_from date,p_to date,p_module text default 'all',p_actor uuid default null,p_offset integer default 0,p_limit integer default 50)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare staff public.staff_role:=public.current_staff_role(); result jsonb;
begin
 if staff is null or staff not in ('OWNER','MANAGER') then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 if p_from is null or p_to is null or not isfinite(p_from) or not isfinite(p_to) or p_to<p_from or p_to-p_from>365
 or p_module is null or p_module not in ('all','rooms','guests','reservations','billing','housekeeping','staff','maintenance','expenses','settings')
 or p_offset is null or p_offset<0 or p_limit is null or p_limit not between 1 and 100 then raise exception 'INVALID_FILTER'; end if;
 with events as (
  select 'rooms'::text module,a.id event_id,a.entity_id,a.user_id actor_id,a.action,
   a.entity_type||case when a.entity_type='rooms' then coalesce(' '||(a.new_data->>'room_number'),'') else '' end details,a.created_at
  from public.room_activity a
  union all
  select 'guests',a.id,a.guest_id,a.user_id,a.action,'Fields: '||array_to_string(a.changed_fields,', '),a.created_at from public.guest_activity a
  union all
  select 'reservations',a.id,a.reservation_id,a.user_id,a.action,coalesce(r.reservation_number,a.reservation_id::text),a.created_at
  from public.reservation_activity a left join public.reservations r on r.id=a.reservation_id
  union all
  select 'billing',p.id,p.folio_id,p.created_by,p.kind,f.folio_number||' / '||p.method||' / '||f.currency||' '||p.amount::text,p.created_at
  from public.payments p join public.folios f on f.id=p.folio_id
  union all
  select 'billing',e.id,e.folio_id,e.created_by,'EXTRA_CREATE',f.folio_number||' / '||f.currency||' '||e.amount::text,e.created_at
  from public.folio_extras e join public.folios f on f.id=e.folio_id
  union all
  select 'billing',e.id,e.folio_id,e.voided_by,'EXTRA_VOID',f.folio_number||' / '||f.currency||' '||e.amount::text,e.voided_at
  from public.folio_extras e join public.folios f on f.id=e.folio_id where e.voided_at is not null
  union all
  select 'housekeeping',a.id,a.task_id,a.user_id,a.action,'Status: '||a.status,a.created_at from public.housekeeping_activity a
  union all
  select 'staff',a.id,a.profile_id,a.user_id,a.action,'Fields: '||array_to_string(a.changed_fields,', '),a.created_at from public.staff_activity a
  union all
  select 'maintenance',a.id,a.task_id,a.user_id,a.action,coalesce(t.title,a.task_id::text),a.created_at
  from public.maintenance_activity a left join public.maintenance_tasks t on t.id=a.task_id
  union all
  select 'expenses',e.id,e.id,e.created_by,'CREATE',e.category||' / '||e.currency||' '||e.amount::text,e.created_at from public.expenses e
  union all
  select 'expenses',e.id,e.id,e.voided_by,'VOID',e.category||' / '||e.currency||' '||e.amount::text,e.voided_at from public.expenses e where e.voided_at is not null
  union all
  select 'settings',a.id,'00000000-0000-0000-0000-000000000001'::uuid,a.user_id,'UPDATE','Fields: '||array_to_string(a.changed_fields,', '),a.created_at from public.hotel_settings_activity a
 ), filtered as (
  select e.*,p.full_name actor_name from events e left join public.profiles p on p.id=e.actor_id
  where e.created_at >= (p_from::timestamp at time zone 'Asia/Jakarta')
  and e.created_at < ((p_to+1)::timestamp at time zone 'Asia/Jakarta')
  and (p_module='all' or e.module=p_module) and (p_actor is null or e.actor_id=p_actor)
 ), counted as (select count(*) total from filtered), page as (
  select * from filtered order by created_at desc,event_id desc offset p_offset limit p_limit
 )
 select jsonb_build_object('total',(select total from counted),'entries',coalesce((select jsonb_agg(to_jsonb(page) order by created_at desc,event_id desc) from page),'[]'::jsonb)) into result;
 return result;
end; $$;
revoke all on function public.audit_log(date,date,text,uuid,integer,integer) from public,anon;
grant execute on function public.audit_log(date,date,text,uuid,integer,integer) to authenticated;
commit;
