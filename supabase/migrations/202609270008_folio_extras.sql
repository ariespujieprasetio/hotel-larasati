begin;
create table public.folio_extras (
 id uuid primary key,
 folio_id uuid not null references public.folios(id),
 description text not null check(length(btrim(description)) between 2 and 200),
 quantity integer not null check(quantity between 1 and 1000),
 unit_price numeric(14,2) not null check(unit_price>0),
 amount numeric(14,2) generated always as (quantity*unit_price) stored,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default clock_timestamp(),
 voided_at timestamptz,
 voided_by uuid references auth.users(id),
 void_reason text not null default '',
 check((voided_at is null and voided_by is null and void_reason='') or
 (voided_at is not null and voided_by is not null and length(btrim(void_reason)) between 3 and 500))
);
create index folio_extras_folio_idx on public.folio_extras(folio_id,created_at desc,id);
alter table public.folio_extras enable row level security;
revoke all on public.folio_extras from public,anon,authenticated;
grant select on public.folio_extras to authenticated;
create policy folio_extras_read on public.folio_extras for select to authenticated using
 ((select public.current_staff_role()) in ('OWNER','MANAGER','FRONT_OFFICE','FINANCE'));
create function public.add_folio_extra(p_folio uuid,p_request uuid,p_version integer,p_description text,p_quantity integer,p_unit_price numeric)
returns uuid language plpgsql security definer set search_path='' as $$
declare staff public.staff_role:=public.current_staff_role(); f public.folios; previous public.folio_extras; label text:=btrim(p_description); total numeric;
begin
 if staff is null or staff not in ('OWNER','MANAGER','FRONT_OFFICE','FINANCE') then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 if p_request is null or label is null or length(label) not between 2 and 200 or p_quantity is null or p_quantity not between 1 and 1000
 or p_unit_price is null or p_unit_price<=0 or p_unit_price>999999999999.99 or p_unit_price<>round(p_unit_price,2) then raise exception 'INVALID_EXTRA'; end if;
 total:=p_quantity*p_unit_price;
 if total>999999999999.99 then raise exception 'AMOUNT_TOO_LARGE'; end if;
 select * into f from public.folios where id=p_folio for update;
 if not found then raise exception 'FOLIO_NOT_FOUND'; end if;
 select * into previous from public.folio_extras where id=p_request;
 if found then
 if previous.folio_id=p_folio and previous.description=label and previous.quantity=p_quantity and previous.unit_price=p_unit_price and previous.created_by=auth.uid() then return previous.id; end if;
 raise exception 'EXTRA_REQUEST_CONFLICT'; end if;
 if f.closed_at is not null then raise exception 'FOLIO_CLOSED'; end if;
 if f.version is distinct from p_version then raise exception 'STALE_FOLIO'; end if;
 if f.total_amount+total>999999999999.99 then raise exception 'AMOUNT_TOO_LARGE'; end if;
 insert into public.folio_extras(id,folio_id,description,quantity,unit_price,created_by)
 values(p_request,p_folio,label,p_quantity,p_unit_price,auth.uid());
 update public.folios set total_amount=total_amount+total,version=version+1 where id=f.id;
 return p_request;
end; $$;
revoke all on function public.add_folio_extra(uuid,uuid,integer,text,integer,numeric) from public,anon;
grant execute on function public.add_folio_extra(uuid,uuid,integer,text,integer,numeric) to authenticated;
create function public.void_folio_extra(p_id uuid,p_version integer,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare staff public.staff_role:=public.current_staff_role(); item public.folio_extras; f public.folios;
begin
 if staff is null or staff not in ('OWNER','MANAGER') then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 if p_reason is null or length(btrim(p_reason)) not between 3 and 500 then raise exception 'REASON_REQUIRED'; end if;
 select * into item from public.folio_extras where id=p_id;
 if not found then raise exception 'EXTRA_NOT_FOUND'; end if;
 select * into f from public.folios where id=item.folio_id for update;
 select * into item from public.folio_extras where id=p_id;
 if item.voided_at is not null then return item.id; end if;
 if f.closed_at is not null then raise exception 'FOLIO_CLOSED'; end if;
 if f.version is distinct from p_version then raise exception 'STALE_FOLIO'; end if;
 if f.total_amount-item.amount<f.paid_amount then raise exception 'EXTRA_ALREADY_PAID'; end if;
 update public.folio_extras set voided_at=clock_timestamp(),voided_by=auth.uid(),void_reason=btrim(p_reason) where id=item.id;
 update public.folios set total_amount=total_amount-item.amount,version=version+1 where id=f.id;
 return item.id;
end; $$;
revoke all on function public.void_folio_extra(uuid,integer,text) from public,anon;
grant execute on function public.void_folio_extra(uuid,integer,text) to authenticated;
commit;
