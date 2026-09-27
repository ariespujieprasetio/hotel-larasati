begin;
alter table public.hotel_settings add column version integer not null default 1;
create function public.bump_hotel_settings_version() returns trigger language plpgsql set search_path='' as $$
begin new.version:=old.version+1; return new; end; $$;
revoke all on function public.bump_hotel_settings_version() from public,anon,authenticated;
create trigger hotel_settings_version before update on public.hotel_settings for each row execute function public.bump_hotel_settings_version();
-- Existing column grants exclude version; existing RLS permits OWNER/MANAGER only.
commit;
