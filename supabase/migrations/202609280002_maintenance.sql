begin;
create table public.maintenance_tasks (
 id uuid primary key default gen_random_uuid(), room_id uuid not null references public.rooms(id),
 title text not null check(length(btrim(title)) between 3 and 150), description text not null check(length(btrim(description)) between 3 and 2000),
 priority text not null check(priority in ('LOW','NORMAL','HIGH','URGENT')),
 status text not null default 'OPEN' check(status in ('OPEN','IN_PROGRESS','COMPLETED','CANCELLED')),
 assigned_to uuid references public.profiles(id), created_by uuid not null references auth.users(id),
 version integer not null default 1, created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(), closed_at timestamptz
);
create index maintenance_queue_idx on public.maintenance_tasks(status,created_at desc);
create table public.maintenance_activity (
 id uuid primary key default gen_random_uuid(), task_id uuid not null references public.maintenance_tasks(id),
 user_id uuid not null references auth.users(id), action text not null, note text not null check(length(note)<=2200), created_at timestamptz not null default clock_timestamp()
);
create index maintenance_activity_task_idx on public.maintenance_activity(task_id,created_at);
alter table public.maintenance_tasks enable row level security;
alter table public.maintenance_activity enable row level security;
revoke all on public.maintenance_tasks,public.maintenance_activity from public,anon,authenticated;
grant select on public.maintenance_tasks,public.maintenance_activity to authenticated;
create policy maintenance_read on public.maintenance_tasks for select to authenticated using ((select public.current_staff_role()) in ('OWNER','MANAGER','HOUSEKEEPING','FRONT_OFFICE'));
create policy maintenance_activity_read on public.maintenance_activity for select to authenticated using ((select public.current_staff_role()) in ('OWNER','MANAGER','HOUSEKEEPING','FRONT_OFFICE'));
create function public.create_maintenance(p_request uuid,p_room uuid,p_title text,p_description text,p_priority text) returns uuid language plpgsql security definer set search_path='' as $$
declare staff public.staff_role:=public.current_staff_role(); previous public.maintenance_tasks;
begin
 if staff is null or staff not in ('OWNER','MANAGER','HOUSEKEEPING','FRONT_OFFICE') then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 if p_request is null or p_title is null or length(btrim(p_title)) not between 3 and 150 or p_description is null or length(btrim(p_description)) not between 3 and 2000 or p_priority is null or p_priority not in ('LOW','NORMAL','HIGH','URGENT') then raise exception 'INVALID_REPORT'; end if;
 -- Serialize retries for this request, including simultaneous submissions.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_request::text,0));
 select * into previous from public.maintenance_tasks where id=p_request;
 if found then
 if previous.room_id=p_room and previous.title=btrim(p_title) and previous.description=btrim(p_description) and previous.priority=p_priority and previous.created_by=auth.uid() then return previous.id; end if;
 raise exception 'REQUEST_CONFLICT'; end if;
 perform 1 from public.rooms where id=p_room and is_active for share;
 if not found then raise exception 'ROOM_UNAVAILABLE'; end if;
 insert into public.maintenance_tasks(id,room_id,title,description,priority,created_by) values(p_request,p_room,btrim(p_title),btrim(p_description),p_priority,auth.uid());
 insert into public.maintenance_activity(task_id,user_id,action,note) values(p_request,auth.uid(),'CREATED','Report created');
 return p_request;
end; $$;
revoke all on function public.create_maintenance(uuid,uuid,text,text,text) from public,anon;
grant execute on function public.create_maintenance(uuid,uuid,text,text,text) to authenticated;
create function public.maintenance_staff() returns table(id uuid,full_name text) language plpgsql stable security definer set search_path='' as $$
begin
 if public.current_staff_role() is null or public.current_staff_role() not in ('OWNER','MANAGER','HOUSEKEEPING','FRONT_OFFICE') then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 return query select p.id,p.full_name from public.profiles p where p.is_active and p.role in ('OWNER','MANAGER','HOUSEKEEPING') order by p.full_name,p.id;
end; $$;
revoke all on function public.maintenance_staff() from public,anon;
grant execute on function public.maintenance_staff() to authenticated;
create function public.update_maintenance(p_id uuid,p_version integer,p_action text,p_assignee uuid default null,p_note text default '') returns uuid language plpgsql security definer set search_path='' as $$
declare staff public.staff_role:=public.current_staff_role(); task public.maintenance_tasks; person text;
begin
 if staff is null or staff not in ('OWNER','MANAGER','HOUSEKEEPING') then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 if p_action is null or p_action not in ('ASSIGN','START','COMPLETE','CANCEL','NOTE') or p_note is null or length(btrim(p_note))>2000 then raise exception 'INVALID_ACTION'; end if;
 select * into task from public.maintenance_tasks where id=p_id for update;
 if not found then raise exception 'TASK_NOT_FOUND'; end if;
 if task.closed_at is not null then raise exception 'TASK_CLOSED'; end if;
 if task.version is distinct from p_version then raise exception 'STALE_TASK'; end if;
 if staff='HOUSEKEEPING' and (task.assigned_to is distinct from auth.uid() or p_action not in ('START','NOTE')) then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 if p_action in ('COMPLETE','CANCEL','NOTE') and length(btrim(p_note))<3 then raise exception 'NOTE_REQUIRED'; end if;
 if p_action='ASSIGN' then
 if p_assignee is not null then
 select full_name into person from public.profiles where id=p_assignee and is_active and role in ('OWNER','MANAGER','HOUSEKEEPING') for share;
 if not found then raise exception 'ASSIGNEE_UNAVAILABLE'; end if; end if;
 update public.maintenance_tasks set assigned_to=p_assignee where id=p_id;
 elsif p_action='START' then
 if task.status<>'OPEN' then raise exception 'INVALID_TRANSITION'; end if;
 update public.maintenance_tasks set status='IN_PROGRESS' where id=p_id;
 elsif p_action in ('COMPLETE','CANCEL') then
 if p_action='COMPLETE' and task.status<>'IN_PROGRESS' then raise exception 'INVALID_TRANSITION'; end if;
 update public.maintenance_tasks set status=case when p_action='COMPLETE' then 'COMPLETED' else 'CANCELLED' end,closed_at=clock_timestamp() where id=p_id;
 end if;
 update public.maintenance_tasks set version=version+1,updated_at=clock_timestamp() where id=p_id;
 insert into public.maintenance_activity(task_id,user_id,action,note) values(p_id,auth.uid(),p_action,case when p_action='ASSIGN' then coalesce(person,'Unassigned')||case when btrim(p_note)='' then '' else ': '||btrim(p_note) end else btrim(p_note) end);
 return p_id;
end; $$;
revoke all on function public.update_maintenance(uuid,integer,text,uuid,text) from public,anon;
grant execute on function public.update_maintenance(uuid,integer,text,uuid,text) to authenticated;
commit;
