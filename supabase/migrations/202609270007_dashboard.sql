begin;
-- Invoker permissions preserve the existing table RLS. No admin key is used.
create function public.dashboard_summary() returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare
 staff public.staff_role:=public.current_staff_role();
 today date:=(now() at time zone 'Asia/Jakarta')::date;
 start_at timestamptz; end_at timestamptz;
 result jsonb; section jsonb;
begin
 if staff is null then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 start_at:=today::timestamp at time zone 'Asia/Jakarta';
 end_at:=(today+1)::timestamp at time zone 'Asia/Jakarta';
 result:=jsonb_build_object('date',today,'as_of',now());
 if staff in ('OWNER','MANAGER','FRONT_OFFICE','HOUSEKEEPING') then
 select jsonb_build_object('active',count(*),'occupied',count(*) filter(where status='OCCUPIED'),
 'ready',count(*) filter(where status in ('AVAILABLE','INSPECTED')),
 'blocked',count(*) filter(where status in ('OUT_OF_ORDER','MAINTENANCE')))
 into section from public.rooms where is_active;
 result:=result||jsonb_build_object('rooms',section);
 select jsonb_build_object('open',count(*),'unassigned',count(*) filter(where assigned_to is null),
 'mine',count(*) filter(where assigned_to=auth.uid())) into section
 from public.housekeeping_tasks where closed_at is null;
 result:=result||jsonb_build_object('housekeeping',section);
 end if;
 if staff in ('OWNER','MANAGER','FRONT_OFFICE') then
 select jsonb_build_object(
 'arrivals',count(*) filter(where check_in_date=today and status in ('PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT')),
 'awaiting',count(*) filter(where check_in_date=today and status in ('PENDING','CONFIRMED')),
 'departures',count(*) filter(where check_out_date=today and status in ('CHECKED_IN','CHECKED_OUT')),
 'due',count(*) filter(where check_out_date=today and status='CHECKED_IN'),
 'overdue',count(*) filter(where check_out_date<today and status='CHECKED_IN')) into section
 from public.reservations;
 result:=result||jsonb_build_object('bookings',section);
 end if;
 if staff in ('OWNER','MANAGER','FRONT_OFFICE','FINANCE') then
 select coalesce(jsonb_agg(to_jsonb(t) order by t.currency),'[]'::jsonb) into section from (
 select f.currency,
 coalesce(sum(p.amount) filter(where p.kind='PAYMENT'),0)::text as received,
 coalesce(sum(p.amount) filter(where p.kind='REVERSAL'),0)::text as reversed,
 sum(case when p.kind='PAYMENT' then p.amount else -p.amount end)::text as net
 from public.payments p join public.folios f on f.id=p.folio_id
 where p.created_at>=start_at and p.created_at<end_at group by f.currency
 ) t;
 result:=result||jsonb_build_object('payments',section);
 end if;
 return result;
end; $$;
revoke all on function public.dashboard_summary() from public,anon;
grant execute on function public.dashboard_summary() to authenticated;
commit;
