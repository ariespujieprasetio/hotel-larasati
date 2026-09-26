begin;
create schema if not exists extensions;
create extension if not exists btree_gist with schema extensions;
set local search_path=public,extensions;
create sequence public.reservation_number_seq;
create table public.reservations (
 id uuid primary key default gen_random_uuid(),
 reservation_number text not null unique,
 guest_id uuid not null references public.guests(id),
 room_type_id uuid not null references public.room_types(id),
 room_id uuid not null references public.rooms(id),
 check_in_date date not null, check_out_date date not null,
 adults integer not null check(adults between 1 and 30),
 children integer not null default 0 check(children between 0 and 29),
 source text not null check(source in ('WALK_IN','PHONE','WHATSAPP','DIRECT','OTA','TRAVEL_AGENT','OTHER')),
 status text not null check(status in ('PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED','NO_SHOW')),
 special_request text not null default '' check(length(special_request)<=2000),
 notes text not null default '' check(length(notes)<=2000),
 cancellation_reason text not null default '' check(length(cancellation_reason)<=500),
 nightly_rate numeric(14,2) not null check(nightly_rate>=0),
 room_subtotal numeric(14,2) not null check(room_subtotal>=0),
 discount_amount numeric(14,2) not null check(discount_amount between 0 and room_subtotal),
 service_percentage numeric(5,2) not null check(service_percentage between 0 and 100),
 tax_percentage numeric(5,2) not null check(tax_percentage between 0 and 100),
 service_amount numeric(14,2) not null check(service_amount>=0),
 tax_amount numeric(14,2) not null check(tax_amount>=0),
 total_amount numeric(14,2) not null check(total_amount>=0),
 currency text not null check(currency ~ '^[A-Z]{3}$'),
 created_by uuid not null references auth.users(id),
 version integer not null default 1,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check(check_out_date>check_in_date and check_out_date-check_in_date<=365),
 check(adults+children<=30),
 constraint reservations_no_overlap exclude using gist
 (room_id with =,daterange(check_in_date,check_out_date,'[)') with &&)
 where(status in ('PENDING','CONFIRMED','CHECKED_IN'))
);
create index reservations_guest_idx on public.reservations(guest_id,check_in_date desc);
create index reservations_arrival_idx on public.reservations(check_in_date,status);
create index reservations_type_idx on public.reservations(room_type_id);
create table public.reservation_activity (
 id uuid primary key default gen_random_uuid(),
 reservation_id uuid not null references public.reservations(id),
 user_id uuid references auth.users(id) on delete set null,
 action text not null,old_data jsonb,new_data jsonb not null,created_at timestamptz not null default now()
);
create index reservation_activity_idx on public.reservation_activity(reservation_id,created_at desc);
alter table public.reservations enable row level security;
alter table public.reservation_activity enable row level security;
revoke all on public.reservations,public.reservation_activity from anon,authenticated;
revoke all on sequence public.reservation_number_seq from public,anon,authenticated;
grant select on public.reservations,public.reservation_activity to authenticated;
create policy reservations_read on public.reservations for select to authenticated using
 ((select public.current_staff_role()) in ('OWNER','MANAGER','FRONT_OFFICE'));
create policy reservation_activity_read on public.reservation_activity for select to authenticated using
 ((select public.current_staff_role()) in ('OWNER','MANAGER','FRONT_OFFICE'));

-- Authoritative monetary formula. Preview and save both use this function.
create function public.reservation_amounts(rate numeric,nights integer,discount numeric,service_pct numeric,tax_pct numeric)
returns jsonb language plpgsql immutable set search_path='' as $$
declare subtotal numeric; net numeric; service numeric; tax numeric; total numeric;
begin
 if rate is null or nights is null or discount is null or service_pct is null or tax_pct is null
 or rate<0 or nights not between 1 and 365 or discount<0 or discount<>round(discount,2)
 or service_pct not between 0 and 100 or tax_pct not between 0 and 100 then raise exception 'INVALID_QUOTE'; end if;
 subtotal:=round(rate*nights,2);
 if discount>subtotal then raise exception 'DISCOUNT_TOO_LARGE'; end if;
 net:=subtotal-discount;service:=round(net*service_pct/100,2);
 tax:=round((net+service)*tax_pct/100,2);total:=net+service+tax;
 if total>999999999999.99 or subtotal>999999999999.99 then raise exception 'AMOUNT_TOO_LARGE'; end if;
 return jsonb_build_object('nights',nights,'nightly_rate',rate,'room_subtotal',subtotal,'discount_amount',discount,
 'service_percentage',service_pct,'tax_percentage',tax_pct,'service_amount',service,'tax_amount',tax,'total_amount',total);
end; $$;
revoke all on function public.reservation_amounts(numeric,integer,numeric,numeric,numeric) from public,anon,authenticated;

create function public.reservation_preview(p_data jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 staff public.staff_role:=public.current_staff_role();
 v_id uuid:=nullif(p_data->>'id','')::uuid;
 v_type uuid:=(p_data->>'room_type_id')::uuid;
 arrival date:=(p_data->>'check_in_date')::date;
 departure date:=(p_data->>'check_out_date')::date;
 adults integer:=(p_data->>'adults')::integer;
 children integer:=(p_data->>'children')::integer;
 discount numeric:=(p_data->>'discount_amount')::numeric;
 rt public.room_types; hotel public.hotel_settings; previous public.reservations;
 rate numeric; service_pct numeric; tax_pct numeric; currency text; result jsonb; options jsonb;
begin
 if staff is null or staff not in ('OWNER','MANAGER','FRONT_OFFICE') then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 if v_id is not null then
 select * into previous from public.reservations where id=v_id;
 if not found or previous.status not in ('PENDING','CONFIRMED') then raise exception 'RESERVATION_NOT_EDITABLE'; end if;
 end if;
 if arrival is null or departure is null or departure<=arrival or departure-arrival>365
 or adults is null or adults not between 1 and 30 or children is null or children not between 0 and 29
 or discount is null or discount<0 then raise exception 'INVALID_RESERVATION'; end if;
 if arrival<(now() at time zone 'Asia/Jakarta')::date and (v_id is null or arrival<>previous.check_in_date) then raise exception 'ARRIVAL_IN_PAST'; end if;
 select * into rt from public.room_types where id=v_type and is_active;
 if not found then raise exception 'ROOM_TYPE_INACTIVE'; end if;
 if adults+children>rt.capacity then raise exception 'CAPACITY_EXCEEDED'; end if;
 if staff='FRONT_OFFICE' and discount<>coalesce(previous.discount_amount,0) then raise exception 'DISCOUNT_REQUIRES_MANAGER' using errcode='42501'; end if;
 select * into hotel from public.hotel_settings limit 1;
 if not found then raise exception 'HOTEL_SETTINGS_MISSING'; end if;
 if v_id is not null and v_type=previous.room_type_id and arrival=previous.check_in_date and departure=previous.check_out_date and discount=previous.discount_amount then
 rate:=previous.nightly_rate;service_pct:=previous.service_percentage;tax_pct:=previous.tax_percentage;currency:=previous.currency;
 else rate:=rt.base_price;service_pct:=hotel.service_charge_percentage;tax_pct:=hotel.tax_percentage;currency:=hotel.default_currency;
 end if;
 result:=public.reservation_amounts(rate,departure-arrival,discount,service_pct,tax_pct);
 select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'room_number',r.room_number,'status',r.status) order by r.room_number),'[]'::jsonb)
 into options from public.rooms r
 where r.room_type_id=v_type and r.is_active and r.status not in ('OUT_OF_ORDER','MAINTENANCE','OCCUPIED','RESERVED')
 and not exists(select 1 from public.reservations b where b.room_id=r.id and (v_id is null or b.id<>v_id)
 and b.status in ('PENDING','CONFIRMED','CHECKED_IN')
 and daterange(b.check_in_date,b.check_out_date,'[)') && daterange(arrival,departure,'[)'));
 return result||jsonb_build_object('currency',currency,'rooms',options);
end; $$;
revoke all on function public.reservation_preview(jsonb) from public,anon;
grant execute on function public.reservation_preview(jsonb) to authenticated;

create function public.save_reservation(p_data jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare
 staff public.staff_role:=public.current_staff_role();
 v_id uuid:=nullif(p_data->>'id','')::uuid;
 v_guest uuid:=(p_data->>'guest_id')::uuid;
 v_type uuid:=(p_data->>'room_type_id')::uuid;
 v_room uuid:=nullif(p_data->>'room_id','')::uuid;
 previous public.reservations; q jsonb; booking public.reservations; option jsonb;
begin
 if staff is null or staff not in ('OWNER','MANAGER','FRONT_OFFICE') then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 if v_id is not null then
 select * into previous from public.reservations where id=v_id for update;
 if not found or previous.status not in ('PENDING','CONFIRMED') then raise exception 'RESERVATION_NOT_EDITABLE'; end if;
 if (p_data->>'version')::integer is distinct from previous.version then raise exception 'STALE_RESERVATION'; end if;
 end if;
 perform 1 from public.guests where id=v_guest and is_active for share;
 if not found then raise exception 'GUEST_INACTIVE'; end if;
 -- Serializes allocations of the same room type; the exclusion constraint is
 -- the final protection even if another trusted writer bypasses this RPC.
 perform 1 from public.room_types where id=v_type and is_active for update;
 if not found then raise exception 'ROOM_TYPE_INACTIVE'; end if;
 perform 1 from public.hotel_settings for share;
 q:=public.reservation_preview(p_data);
 if (p_data->>'expected_total')::numeric is distinct from (q->>'total_amount')::numeric or (p_data->>'expected_currency') is distinct from (q->>'currency') then raise exception 'QUOTE_CHANGED'; end if;
 if v_room is null then
 select (value->>'id')::uuid into v_room from jsonb_array_elements(q->'rooms') limit 1;
 else
 select value into option from jsonb_array_elements(q->'rooms') where (value->>'id')::uuid=v_room;
 if not found then raise exception 'ROOM_UNAVAILABLE'; end if;
 end if;
 if v_room is null then raise exception 'ROOM_UNAVAILABLE'; end if;
 booking.id:=coalesce(v_id,gen_random_uuid());
 booking.guest_id:=v_guest;booking.room_type_id:=v_type;booking.room_id:=v_room;
 booking.check_in_date:=(p_data->>'check_in_date')::date;booking.check_out_date:=(p_data->>'check_out_date')::date;
 booking.adults:=(p_data->>'adults')::integer;booking.children:=(p_data->>'children')::integer;
 booking.source:=p_data->>'source';
 booking.special_request:=coalesce(p_data->>'special_request','');booking.notes:=coalesce(p_data->>'notes','');
 booking.nightly_rate:=(q->>'nightly_rate')::numeric;booking.room_subtotal:=(q->>'room_subtotal')::numeric;
 booking.discount_amount:=(q->>'discount_amount')::numeric;
 booking.service_percentage:=(q->>'service_percentage')::numeric;booking.tax_percentage:=(q->>'tax_percentage')::numeric;
 booking.service_amount:=(q->>'service_amount')::numeric;booking.tax_amount:=(q->>'tax_amount')::numeric;
 booking.total_amount:=(q->>'total_amount')::numeric;booking.currency:=q->>'currency';
 if v_id is null then
 booking.status:=p_data->>'status';
 if booking.status is null or booking.status not in ('PENDING','CONFIRMED') then raise exception 'INVALID_STATUS'; end if;
 select reservation_prefix||'-'||nextval('public.reservation_number_seq')::text into booking.reservation_number from public.hotel_settings limit 1;
 booking.created_by:=auth.uid();booking.version:=1;booking.created_at:=now();booking.updated_at:=now();booking.cancellation_reason:='';
 insert into public.reservations select booking.*;
 else
 update public.reservations set guest_id=booking.guest_id,room_type_id=booking.room_type_id,room_id=booking.room_id,
 check_in_date=booking.check_in_date,check_out_date=booking.check_out_date,adults=booking.adults,children=booking.children,
 source=booking.source,special_request=booking.special_request,notes=booking.notes,
 nightly_rate=booking.nightly_rate,room_subtotal=booking.room_subtotal,discount_amount=booking.discount_amount,
 service_percentage=booking.service_percentage,tax_percentage=booking.tax_percentage,service_amount=booking.service_amount,
 tax_amount=booking.tax_amount,total_amount=booking.total_amount,currency=booking.currency,
 version=previous.version+1,updated_at=clock_timestamp() where id=v_id;
 end if;
 return booking.id;
end; $$;
revoke all on function public.save_reservation(jsonb) from public,anon;
grant execute on function public.save_reservation(jsonb) to authenticated;

create function public.set_reservation_status(p_id uuid,p_version integer,p_status text,p_reason text default '')
returns uuid language plpgsql security definer set search_path='' as $$
declare previous public.reservations; staff public.staff_role:=public.current_staff_role();
begin
 if staff is null or staff not in ('OWNER','MANAGER','FRONT_OFFICE') then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 select * into previous from public.reservations where id=p_id for update;
 if not found then raise exception 'RESERVATION_NOT_FOUND'; end if;
 if previous.version is distinct from p_version then raise exception 'STALE_RESERVATION'; end if;
 if previous.status not in ('PENDING','CONFIRMED') or p_status is null or p_status not in ('CONFIRMED','CANCELLED','NO_SHOW') or p_status=previous.status then raise exception 'INVALID_STATUS'; end if;
 if p_status='NO_SHOW' and previous.check_in_date>(now() at time zone 'Asia/Jakarta')::date then raise exception 'NO_SHOW_TOO_EARLY'; end if;
 if p_status in ('CANCELLED','NO_SHOW') and (p_reason is null or length(btrim(p_reason)) not between 3 and 500) then raise exception 'REASON_REQUIRED'; end if;
 if p_status='CONFIRMED' and not exists(select 1 from public.guests where id=previous.guest_id and is_active) then raise exception 'GUEST_INACTIVE'; end if;
 update public.reservations set status=p_status,cancellation_reason=case when p_status='CONFIRMED' then '' else btrim(p_reason) end,
 version=version+1,updated_at=clock_timestamp() where id=p_id;
 return p_id;
end; $$;
revoke all on function public.set_reservation_status(uuid,integer,text,text) from public,anon;
grant execute on function public.set_reservation_status(uuid,integer,text,text) to authenticated;

create function public.log_reservation_activity() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.reservation_activity(reservation_id,user_id,action,old_data,new_data)
 values(new.id,auth.uid(),case when tg_op='INSERT' then 'CREATE' when old.status<>new.status then new.status else 'UPDATE' end,
 case when tg_op='UPDATE' then to_jsonb(old)-'notes'-'special_request' else null end,to_jsonb(new)-'notes'-'special_request');
 return new;
end; $$;
revoke all on function public.log_reservation_activity() from public,anon,authenticated;
create trigger reservation_activity_log after insert or update on public.reservations for each row execute function public.log_reservation_activity();

-- Existing readiness updates remain valid. Blocking a booked room or changing
-- its type requires reassigning/cancelling those bookings first.
create function public.protect_booked_inventory() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_table_name='rooms' then
  if new.room_type_id<>old.room_type_id then perform 1 from public.room_types where id=old.room_type_id for update; end if;
  if (not new.is_active or new.room_type_id<>old.room_type_id or new.status in ('OUT_OF_ORDER','MAINTENANCE'))
   and exists(select 1 from public.reservations where room_id=old.id and status in ('PENDING','CONFIRMED','CHECKED_IN'))
   then raise exception 'ROOM_HAS_RESERVATIONS'; end if;
 elsif tg_table_name='room_types' then
  if exists(select 1 from public.reservations where room_type_id=old.id and status in ('PENDING','CONFIRMED','CHECKED_IN') and adults+children>new.capacity)
   then raise exception 'CAPACITY_HAS_RESERVATIONS'; end if;
 elsif tg_table_name='guests' then
  if not new.is_active and exists(select 1 from public.reservations where guest_id=old.id and status in ('PENDING','CONFIRMED','CHECKED_IN'))
   then raise exception 'GUEST_HAS_RESERVATIONS'; end if;
 end if;
 return new;
end; $$;
revoke all on function public.protect_booked_inventory() from public,anon,authenticated;
-- Alphabetically after room_guard, which acquires the current type lock.
create trigger zz_booked_room_guard before update on public.rooms for each row execute function public.protect_booked_inventory();
create trigger zz_booked_type_guard before update on public.room_types for each row execute function public.protect_booked_inventory();
create trigger zz_booked_guest_guard before update on public.guests for each row execute function public.protect_booked_inventory();
commit;
