begin;
create index payments_created_at_idx on public.payments(created_at);
create function public.payment_report(p_from date,p_to date) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare staff public.staff_role:=public.current_staff_role(); result jsonb;
begin
 if staff is null or staff not in ('OWNER','MANAGER','FINANCE') then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 if p_from is null or p_to is null or not isfinite(p_from) or not isfinite(p_to) or p_to<p_from or p_to-p_from>365 then raise exception 'INVALID_REPORT_DATES'; end if;
 with entries as (
 select f.currency,p.method,p.kind,p.amount from public.payments p join public.folios f on f.id=p.folio_id
 where p.created_at >= (p_from::timestamp at time zone 'Asia/Jakarta')
 and p.created_at < ((p_to+1)::timestamp at time zone 'Asia/Jakarta')
 ), grouped as (
 select currency,method,count(*) as entries,
 coalesce(sum(amount) filter(where kind='PAYMENT'),0)::text as received,
 coalesce(sum(amount) filter(where kind='REVERSAL'),0)::text as reversed,
 sum(case when kind='PAYMENT' then amount else -amount end)::text as net
 from entries group by grouping sets ((currency),(currency,method))
 )
 select jsonb_build_object('from',p_from,'to',p_to,'generated_at',now(),
 'totals',coalesce((select jsonb_agg(to_jsonb(g)-'method' order by currency) from grouped g where method is null),'[]'::jsonb),
 'methods',coalesce((select jsonb_agg(to_jsonb(g) order by currency,method) from grouped g where method is not null),'[]'::jsonb)) into result;
 return result;
end; $$;
revoke all on function public.payment_report(date,date) from public,anon;
grant execute on function public.payment_report(date,date) to authenticated;
commit;
