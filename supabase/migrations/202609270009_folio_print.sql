begin;
-- Stable snapshot, restricted to guest-facing billing fields.
create function public.folio_print(p_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare staff public.staff_role:=public.current_staff_role(); result jsonb;
begin
 if staff is null or staff not in ('OWNER','MANAGER','FRONT_OFFICE','FINANCE') then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 select jsonb_build_object(
 'folio',jsonb_build_object('folio_number',f.folio_number,'reservation_number',f.reservation_number,'guest_name',f.guest_name,'room_number',f.room_number,'currency',f.currency,'charges',f.charges,'total_amount',f.total_amount,'paid_amount',f.paid_amount,'balance',f.balance,'created_at',f.created_at,'closed_at',f.closed_at,'version',f.version),
 'hotel',jsonb_build_object('hotel_name',h.hotel_name,'address',h.address,'phone',h.phone,'email',h.email),
 'arrival',b.check_in_date,'departure',b.check_out_date,'generated_at',now(),
 'extras',coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'description',e.description,'quantity',e.quantity,'unit_price',e.unit_price,'amount',e.amount) order by e.created_at,e.id) from public.folio_extras e where e.folio_id=f.id and e.voided_at is null),'[]'::jsonb),
 'payments',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'kind',p.kind,'amount',p.amount,'method',p.method,'created_at',p.created_at) order by p.created_at,p.id) from public.payments p where p.folio_id=f.id),'[]'::jsonb)) into result
 from public.folios f join public.reservations b on b.id=f.reservation_id cross join public.hotel_settings h where f.id=p_id;
 return result;
end; $$;
revoke all on function public.folio_print(uuid) from public,anon;
grant execute on function public.folio_print(uuid) to authenticated;
commit;
