begin;
create index folios_closed_at_idx on public.folios(closed_at);
create function public.operational_report(p_kind text,p_from date,p_to date) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare staff public.staff_role:=public.current_staff_role(); rows jsonb; today date:=(now() at time zone 'Asia/Jakarta')::date; start_at timestamptz; end_at timestamptz;
begin
 if staff is null or staff not in ('OWNER','MANAGER','FINANCE') then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 if p_kind is null or p_kind not in ('occupancy','revenue','financial') or p_from is null or p_to is null or not isfinite(p_from) or not isfinite(p_to) or p_to<p_from or p_to-p_from>365 or p_to>today then raise exception 'INVALID_REPORT_DATES'; end if;
 start_at:=p_from::timestamp at time zone 'Asia/Jakarta';end_at:=(p_to+1)::timestamp at time zone 'Asia/Jakarta';
 if p_kind='occupancy' then
 with days as(select p_from+i as day,case when p_from+i=today then now() else (p_from+i+1)::timestamp at time zone 'Asia/Jakarta' end as snapshot from generate_series(0,p_to-p_from) i),
 counts as(select d.day,
 (select count(distinct s.room_id) from public.stays s where s.checked_in_at<d.snapshot and (s.checked_out_at is null or s.checked_out_at>=d.snapshot)) as occupied,
 (select count(*) from public.stays s where s.checked_in_at>=d.day::timestamp at time zone 'Asia/Jakarta' and s.checked_in_at<(d.day+1)::timestamp at time zone 'Asia/Jakarta') as arrivals,
 (select count(*) from public.stays s where s.checked_out_at>=d.day::timestamp at time zone 'Asia/Jakarta' and s.checked_out_at<(d.day+1)::timestamp at time zone 'Asia/Jakarta') as departures,
 (select count(*) from public.rooms r cross join lateral (
 select a.new_data from public.room_activity a where a.entity_type='rooms' and a.entity_id=r.id and a.created_at<d.snapshot order by a.created_at desc,(a.new_data->>'version')::integer desc limit 1
 ) h where (h.new_data->>'is_active')::boolean) as active_rooms
 from days d)
 select coalesce(jsonb_agg(jsonb_build_object('date',day,'occupied',occupied,'active_rooms',active_rooms,'occupancy_pct',case when active_rooms=0 then null else round(occupied*100.0/active_rooms,2)::text end,'check_ins',arrivals,'check_outs',departures) order by day),'[]'::jsonb) into rows from counts;
 elsif p_kind='revenue' then
 with bills as(select (closed_at at time zone 'Asia/Jakarta')::date as day,currency,total_amount,
 (charges->>'room_subtotal')::numeric as subtotal,(charges->>'discount_amount')::numeric as discount,
 (charges->>'service_amount')::numeric as service,(charges->>'tax_amount')::numeric as tax
 from public.folios where closed_at>=start_at and closed_at<end_at),
 grouped as(select day,currency,count(*) as bills,sum(subtotal)::text as room_subtotal,sum(discount)::text as discount,sum(service)::text as service,sum(tax)::text as tax,
 sum(total_amount-subtotal+discount-service-tax)::text as extras,sum(total_amount)::text as billed_total
 from bills group by grouping sets ((day,currency),(currency)))
 select coalesce(jsonb_agg(jsonb_build_object('date',coalesce(day::text,'TOTAL'),'currency',currency,'bills',bills,'room_subtotal',room_subtotal,'discount',discount,'service',service,'tax',tax,'extras',extras,'billed_total',billed_total) order by currency,day nulls last),'[]'::jsonb) into rows from grouped;
 else
 with receipts as(select f.currency,
 coalesce(sum(p.amount) filter(where p.kind='PAYMENT'),0) as received,coalesce(sum(p.amount) filter(where p.kind='REVERSAL'),0) as reversed
 from public.payments p join public.folios f on f.id=p.folio_id where p.created_at>=start_at and p.created_at<end_at group by f.currency),
 closed as(select currency,sum(total_amount) as billed from public.folios where closed_at>=start_at and closed_at<end_at group by currency),
 outstanding as(select currency,count(*) as open_bills,sum(balance) as balance from public.folios where closed_at is null group by currency),
 currencies as(select currency from receipts union select currency from closed union select currency from outstanding)
 select coalesce(jsonb_agg(jsonb_build_object('currency',c.currency,'received',coalesce(r.received,0)::text,'reversed',coalesce(r.reversed,0)::text,'net_received',(coalesce(r.received,0)-coalesce(r.reversed,0))::text,'closed_bill_total',coalesce(b.billed,0)::text,'open_bills_now',coalesce(o.open_bills,0),'outstanding_now',coalesce(o.balance,0)::text) order by c.currency),'[]'::jsonb) into rows
 from currencies c left join receipts r using(currency) left join closed b using(currency) left join outstanding o using(currency);
 end if;
 return jsonb_build_object('kind',p_kind,'from',p_from,'to',p_to,'generated_at',now(),'rows',rows);
end; $$;
revoke all on function public.operational_report(text,date,date) from public,anon;
grant execute on function public.operational_report(text,date,date) to authenticated;
commit;
