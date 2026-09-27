begin;
alter table public.stays add column checked_out_by uuid references auth.users(id);
create sequence public.folio_number_seq;
create table public.folios (
 id uuid primary key default gen_random_uuid(),
 reservation_id uuid not null unique references public.reservations(id),
 folio_number text not null unique default ('FOL-'||nextval('public.folio_number_seq')::text),
 reservation_number text not null,
 guest_name text not null,
 room_number text not null,
 currency text not null check(currency ~ '^[A-Z]{3}$'),
 charges jsonb not null,
 total_amount numeric(14,2) not null check(total_amount>=0),
 paid_amount numeric(14,2) not null default 0 check(paid_amount>=0 and paid_amount<=total_amount),
 balance numeric(14,2) generated always as (total_amount-paid_amount) stored,
 version integer not null default 1,
 created_at timestamptz not null default clock_timestamp(),
 closed_at timestamptz
);
create table public.payments (
 id uuid primary key,
 folio_id uuid not null references public.folios(id),
 kind text not null check(kind in ('PAYMENT','REVERSAL')),
 amount numeric(14,2) not null check(amount>0),
 method text not null check(method in ('CASH','BANK_TRANSFER','CARD','QRIS')),
 reference text not null default '' check(length(reference)<=150),
 reversal_of uuid unique references public.payments(id),
 reason text not null default '' check(length(reason)<=500),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default clock_timestamp(),
 check((kind='PAYMENT' and reversal_of is null and reason='') or
       (kind='REVERSAL' and reversal_of is not null and length(btrim(reason))>=3))
);
create index payments_folio_idx on public.payments(folio_id,created_at);
create index folios_created_idx on public.folios(created_at desc);
alter table public.folios enable row level security;
alter table public.payments enable row level security;
revoke all on public.folios,public.payments from public,anon,authenticated;
revoke all on sequence public.folio_number_seq from public,anon,authenticated;
grant select on public.folios,public.payments to authenticated;
create policy folios_read on public.folios for select to authenticated using
 ((select public.current_staff_role()) in ('OWNER','MANAGER','FRONT_OFFICE','FINANCE'));
create policy payments_read on public.payments for select to authenticated using
 ((select public.current_staff_role()) in ('OWNER','MANAGER','FRONT_OFFICE','FINANCE'));

create function public.open_reservation_folio() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.status='CHECKED_IN' and old.status is distinct from new.status then
  insert into public.folios(reservation_id,reservation_number,guest_name,room_number,currency,charges,total_amount)
  select new.id,new.reservation_number,g.full_name,r.room_number,new.currency,
   jsonb_build_object('nightly_rate',new.nightly_rate,'nights',new.check_out_date-new.check_in_date,
    'room_subtotal',new.room_subtotal,'discount_amount',new.discount_amount,
    'service_percentage',new.service_percentage,'tax_percentage',new.tax_percentage,
    'service_amount',new.service_amount,'tax_amount',new.tax_amount),new.total_amount
  from public.guests g, public.rooms r where g.id=new.guest_id and r.id=new.room_id;
 end if;
 return new;
end; $$;
revoke all on function public.open_reservation_folio() from public,anon,authenticated;
create trigger reservation_open_folio after update on public.reservations for each row execute function public.open_reservation_folio();
-- Existing checked-in guests receive the same agreed room bill, with no invented payments.
insert into public.folios(reservation_id,reservation_number,guest_name,room_number,currency,charges,total_amount)
select b.id,b.reservation_number,g.full_name,r.room_number,b.currency,
 jsonb_build_object('nightly_rate',b.nightly_rate,'nights',b.check_out_date-b.check_in_date,
 'room_subtotal',b.room_subtotal,'discount_amount',b.discount_amount,
 'service_percentage',b.service_percentage,'tax_percentage',b.tax_percentage,
 'service_amount',b.service_amount,'tax_amount',b.tax_amount),b.total_amount
from public.reservations b join public.guests g on g.id=b.guest_id join public.rooms r on r.id=b.room_id
where b.status='CHECKED_IN';

create function public.record_payment(p_folio uuid,p_request uuid,p_amount numeric,p_method text,p_reference text default '')
returns uuid language plpgsql security definer set search_path='' as $$
declare staff public.staff_role:=public.current_staff_role(); f public.folios; previous public.payments; reference_value text:=btrim(coalesce(p_reference,''));
begin
 if staff is null or staff not in ('OWNER','MANAGER','FRONT_OFFICE','FINANCE') then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 if p_request is null or p_amount is null or p_amount<=0 or p_amount>999999999999.99 or p_amount<>round(p_amount,2)
 or p_method is null or p_method not in ('CASH','BANK_TRANSFER','CARD','QRIS') or length(reference_value)>150
 or (p_method<>'CASH' and length(reference_value)<3) then raise exception 'INVALID_PAYMENT'; end if;
 select * into f from public.folios where id=p_folio for update;
 if not found then raise exception 'FOLIO_NOT_FOUND'; end if;
 select * into previous from public.payments where id=p_request;
 if found then
  if previous.folio_id=p_folio and previous.kind='PAYMENT' and previous.amount=p_amount
   and previous.method=p_method and previous.reference=reference_value and previous.created_by=auth.uid() then return previous.id; end if;
  raise exception 'PAYMENT_REQUEST_CONFLICT';
 end if;
 if f.closed_at is not null then raise exception 'FOLIO_CLOSED'; end if;
 if p_amount>f.balance then raise exception 'PAYMENT_EXCEEDS_BALANCE'; end if;
 insert into public.payments(id,folio_id,kind,amount,method,reference,created_by)
 values(p_request,p_folio,'PAYMENT',p_amount,p_method,reference_value,auth.uid());
 update public.folios set paid_amount=paid_amount+p_amount,version=version+1 where id=p_folio;
 return p_request;
end; $$;
revoke all on function public.record_payment(uuid,uuid,numeric,text,text) from public,anon;
grant execute on function public.record_payment(uuid,uuid,numeric,text,text) to authenticated;

create function public.reverse_payment(p_payment uuid,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare staff public.staff_role:=public.current_staff_role(); payment public.payments; f public.folios; reversal uuid;
begin
 if staff is null or staff not in ('OWNER','MANAGER') then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 if p_reason is null or length(btrim(p_reason)) not between 3 and 500 then raise exception 'REASON_REQUIRED'; end if;
 select * into payment from public.payments where id=p_payment and kind='PAYMENT';
 if not found then raise exception 'PAYMENT_NOT_FOUND'; end if;
 select * into f from public.folios where id=payment.folio_id for update;
 select id into reversal from public.payments where reversal_of=payment.id;
 if found then return reversal; end if;
 if f.closed_at is not null then raise exception 'FOLIO_CLOSED'; end if;
 reversal:=gen_random_uuid();
 insert into public.payments(id,folio_id,kind,amount,method,reference,reversal_of,reason,created_by)
 values(reversal,f.id,'REVERSAL',payment.amount,payment.method,payment.reference,payment.id,btrim(p_reason),auth.uid());
 update public.folios set paid_amount=paid_amount-payment.amount,version=version+1 where id=f.id;
 return reversal;
end; $$;
revoke all on function public.reverse_payment(uuid,text) from public,anon;
grant execute on function public.reverse_payment(uuid,text) to authenticated;

create function public.check_out_reservation(p_folio uuid,p_version integer)
returns uuid language plpgsql security definer set search_path='' as $$
declare staff public.staff_role:=public.current_staff_role(); f public.folios; booking public.reservations; stay public.stays; room public.rooms; booking_id uuid;
begin
 if staff is null or staff not in ('OWNER','MANAGER','FRONT_OFFICE') then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 select reservation_id into booking_id from public.folios where id=p_folio;
 if not found then raise exception 'FOLIO_NOT_FOUND'; end if;
 select * into booking from public.reservations where id=booking_id for update;
 select * into f from public.folios where id=p_folio for update;
 if f.closed_at is not null then raise exception 'FOLIO_CLOSED'; end if;
 if f.version is distinct from p_version then raise exception 'STALE_FOLIO'; end if;
 if f.balance<>0 then raise exception 'BALANCE_DUE'; end if;
 if booking.status<>'CHECKED_IN' then raise exception 'NOT_CHECKED_IN'; end if;
 perform 1 from public.room_types where id=booking.room_type_id for update;
 select * into room from public.rooms where id=booking.room_id for update;
 select * into stay from public.stays where reservation_id=booking.id and checked_out_at is null for update;
 if not found or stay.room_id<>booking.room_id or room.status<>'OCCUPIED' then raise exception 'STAY_ROOM_MISMATCH'; end if;
 update public.stays set checked_out_at=clock_timestamp(),checked_out_by=auth.uid() where id=stay.id;
 update public.reservations set status='CHECKED_OUT',version=version+1,updated_at=clock_timestamp() where id=booking.id;
 update public.folios set closed_at=clock_timestamp(),version=version+1 where id=f.id;
 update public.rooms set status='DIRTY' where id=room.id;
 return booking.id;
end; $$;
revoke all on function public.check_out_reservation(uuid,integer) from public,anon;
grant execute on function public.check_out_reservation(uuid,integer) to authenticated;

create or replace function public.guard_room() returns trigger language plpgsql security definer set search_path='' as $$
declare type_active boolean; staff_role public.staff_role;
begin
 staff_role := public.current_staff_role();
 select is_active into type_active from public.room_types where id=new.room_type_id for update;
 if not found or (new.is_active and not type_active) then
  raise exception 'ROOM_TYPE_INACTIVE' using errcode='P0001';
 end if;
 if tg_op='INSERT' then
  if new.status <> 'AVAILABLE' then raise exception 'ROOM_INITIAL_STATUS' using errcode='P0001'; end if;
  new.version := 1;
 else
  if old.status in ('OCCUPIED','RESERVED') and
     (new.status<>old.status or new.room_type_id<>old.room_type_id or new.is_active<>old.is_active or new.room_number<>old.room_number)
     and not (old.status='OCCUPIED' and new.status='DIRTY'
       and new.room_type_id=old.room_type_id and new.is_active=old.is_active and new.room_number=old.room_number
       and not exists(select 1 from public.stays where room_id=old.id and checked_out_at is null)
       and exists(select 1 from public.stays s join public.reservations b on b.id=s.reservation_id
         where s.room_id=old.id and s.checked_out_at is not null and b.status='CHECKED_OUT'))
     then raise exception 'ROOM_STAY_MANAGED' using errcode='P0001'; end if;
  if new.status<>old.status and new.status in ('OCCUPIED','RESERVED') and not (
    new.status='OCCUPIED' and exists(
     select 1 from public.stays s join public.reservations b on b.id=s.reservation_id
     where s.room_id=new.id and s.checked_out_at is null and b.status='CHECKED_IN'
    )
  ) then raise exception 'ROOM_STAY_MANAGED' using errcode='P0001'; end if;
  if staff_role='HOUSEKEEPING' then
   if not old.is_active or new.is_active<>old.is_active or new.room_number<>old.room_number or
      new.room_type_id<>old.room_type_id or new.floor<>old.floor or new.notes<>old.notes
      then raise exception 'ROOM_STATUS_ONLY' using errcode='42501'; end if;
   if not ((old.status='DIRTY' and new.status='CLEANING') or
           (old.status='CLEANING' and new.status='CLEAN') or
           (old.status='CLEAN' and new.status='INSPECTED') or
           (old.status='INSPECTED' and new.status='AVAILABLE'))
      then raise exception 'ROOM_INVALID_TRANSITION' using errcode='P0001'; end if;
  end if;
  new.version := old.version+1;
  new.created_at := old.created_at;
 end if;
 new.updated_at := clock_timestamp();
 return new;
end; $$;
revoke all on function public.guard_room() from public,anon,authenticated;


commit;
