begin;
create table public.housekeeping_tasks (
 id uuid primary key default gen_random_uuid(),
 room_id uuid not null references public.rooms(id),
 room_number text not null,
 status text not null check(status in ('DIRTY','CLEANING','CLEAN','INSPECTED','COMPLETED','CANCELLED')),
 assigned_to uuid references public.profiles(id) on delete set null,
 assignee_name text,
 version integer not null default 1,
 created_at timestamptz not null default clock_timestamp(),
 updated_at timestamptz not null default clock_timestamp(),
 closed_at timestamptz,
 check((closed_at is null)=(status not in ('COMPLETED','CANCELLED')))
);
create unique index housekeeping_one_open_room on public.housekeeping_tasks(room_id) where closed_at is null;
create index housekeeping_queue_idx on public.housekeeping_tasks(closed_at,created_at desc);
create index housekeeping_assignee_idx on public.housekeeping_tasks(assigned_to) where closed_at is null;
create table public.housekeeping_activity (
 id uuid primary key default gen_random_uuid(),
 task_id uuid not null references public.housekeeping_tasks(id),
 user_id uuid references auth.users(id) on delete set null,
 action text not null check(action in ('CREATED','ROOM_STATUS','ASSIGNED','NOTE','COMPLETED','CANCELLED','ROOM_CHANGED')),
 status text not null,
 note text not null default '' check(length(note)<=2000),
 assignee_name text,
 created_at timestamptz not null default clock_timestamp()
);
create index housekeeping_activity_task_idx on public.housekeeping_activity(task_id,created_at desc);
alter table public.housekeeping_tasks enable row level security;
alter table public.housekeeping_activity enable row level security;
revoke all on public.housekeeping_tasks,public.housekeeping_activity from public,anon,authenticated;
grant select on public.housekeeping_tasks,public.housekeeping_activity to authenticated;
create policy housekeeping_tasks_read on public.housekeeping_tasks for select to authenticated using
 ((select public.current_staff_role()) in ('OWNER','MANAGER','HOUSEKEEPING','FRONT_OFFICE'));
create policy housekeeping_activity_read on public.housekeeping_activity for select to authenticated using
 ((select public.current_staff_role()) in ('OWNER','MANAGER','HOUSEKEEPING','FRONT_OFFICE'));

-- Enforce assignments for direct Room updates too. The existing guard still
-- enforces the ordered cleaning steps and protects occupied rooms.
create function public.guard_housekeeping_assignment() returns trigger
language plpgsql security definer set search_path='' as $$
declare assignee uuid;
begin
 if public.current_staff_role()='HOUSEKEEPING' and new.status<>old.status then
  select assigned_to into assignee from public.housekeeping_tasks where room_id=old.id and closed_at is null;
  if assignee is not null and assignee<>auth.uid() then raise exception 'TASK_ASSIGNED_TO_OTHER' using errcode='42501'; end if;
 end if;
 return new;
end; $$;
revoke all on function public.guard_housekeeping_assignment() from public,anon,authenticated;
create trigger zy_housekeeping_assignment before update on public.rooms for each row execute function public.guard_housekeeping_assignment();

create function public.sync_housekeeping_task() returns trigger
language plpgsql security definer set search_path='' as $$
declare task public.housekeeping_tasks; next_status text; event text; staff public.staff_role:=public.current_staff_role(); actor_name text;
begin
 if tg_op='UPDATE' then
  if new.status=old.status and new.is_active=old.is_active and new.room_number=old.room_number then return new; end if;
 end if;
 select * into task from public.housekeeping_tasks where room_id=new.id and closed_at is null for update;
 if task.id is not null and staff='HOUSEKEEPING' and task.assigned_to is null then
  select full_name into actor_name from public.profiles where id=auth.uid();
  update public.housekeeping_tasks set assigned_to=auth.uid(),assignee_name=actor_name where id=task.id returning * into task;
  insert into public.housekeeping_activity(task_id,user_id,action,status,assignee_name)
  values(task.id,auth.uid(),'ASSIGNED',task.status,actor_name);
 end if;

 if new.is_active and new.status in ('DIRTY','CLEANING','CLEAN','INSPECTED') then
  next_status:=new.status::text;
  if task.id is null then
   insert into public.housekeeping_tasks(room_id,room_number,status)
   values(new.id,new.room_number,next_status) returning * into task;
   event:='CREATED';
  else
   event:=case when task.status=next_status then 'ROOM_CHANGED' else 'ROOM_STATUS' end;
   update public.housekeeping_tasks set status=next_status,room_number=new.room_number,
    version=version+1,updated_at=clock_timestamp() where id=task.id returning * into task;
  end if;
  if staff='HOUSEKEEPING' and task.assigned_to is null then
   select full_name into actor_name from public.profiles where id=auth.uid();
   update public.housekeeping_tasks set assigned_to=auth.uid(),assignee_name=actor_name where id=task.id returning * into task;
   insert into public.housekeeping_activity(task_id,user_id,action,status,assignee_name)
   values(task.id,auth.uid(),'ASSIGNED',task.status,actor_name);
  end if;
 elsif task.id is not null then
  next_status:=case when new.is_active and new.status in ('AVAILABLE','OCCUPIED') then 'COMPLETED' else 'CANCELLED' end;
  event:=next_status;
  update public.housekeeping_tasks set status=next_status,room_number=new.room_number,
   closed_at=clock_timestamp(),updated_at=clock_timestamp(),version=version+1 where id=task.id returning * into task;
 else return new;
 end if;
 insert into public.housekeeping_activity(task_id,user_id,action,status,note,assignee_name)
 values(task.id,auth.uid(),event,task.status,'Room status: '||new.status::text||case when new.is_active then '' else ' (inactive)' end,task.assignee_name);
 return new;
end; $$;
revoke all on function public.sync_housekeeping_task() from public,anon,authenticated;
create trigger rooms_housekeeping_sync after insert or update on public.rooms for each row execute function public.sync_housekeeping_task();

-- Backfill current readiness without inventing previous cleaning events.
with inserted as (
 insert into public.housekeeping_tasks(room_id,room_number,status)
 select id,room_number,status::text from public.rooms where is_active and status in ('DIRTY','CLEANING','CLEAN','INSPECTED')
 returning id,status
)
insert into public.housekeeping_activity(task_id,action,status,note)
select id,'CREATED',status,'Imported current room readiness during setup.' from inserted;

create function public.housekeeping_staff()
returns table(id uuid,full_name text) language plpgsql stable security definer set search_path='' as $$
begin
 if public.current_staff_role() is null or public.current_staff_role() not in ('OWNER','MANAGER','HOUSEKEEPING') then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 return query select p.id,p.full_name from public.profiles p where p.is_active and p.role='HOUSEKEEPING' order by p.full_name,p.id;
end; $$;
revoke all on function public.housekeeping_staff() from public,anon;
grant execute on function public.housekeeping_staff() to authenticated;

create function public.update_housekeeping_task(p_id uuid,p_version integer,p_action text,p_assignee uuid default null,p_note text default '')
returns uuid language plpgsql security definer set search_path='' as $$
declare staff public.staff_role:=public.current_staff_role(); task public.housekeeping_tasks; room public.rooms; type_id uuid; assignee_name_value text; next_status public.room_status;
begin
 if staff is null or staff not in ('OWNER','MANAGER','HOUSEKEEPING') then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
 if p_action is null or p_action not in ('ASSIGN','NOTE','ADVANCE') or p_note is null or length(btrim(p_note))>2000 then raise exception 'INVALID_TASK_ACTION'; end if;
 select * into task from public.housekeeping_tasks where id=p_id;
 if not found then raise exception 'TASK_NOT_FOUND'; end if;
 -- Match inventory lock order; revalidate after acquiring the room lock.
 select room_type_id into type_id from public.rooms where id=task.room_id;
 perform 1 from public.room_types where id=type_id for update;
 select * into room from public.rooms where id=task.room_id for update;
 if room.room_type_id is distinct from type_id then raise exception 'ROOM_CHANGED'; end if;
 select * into task from public.housekeeping_tasks where id=p_id for update;
 if task.closed_at is not null then raise exception 'TASK_CLOSED'; end if;
 if p_version is distinct from task.version then raise exception 'STALE_TASK'; end if;
 if not room.is_active or room.status::text<>task.status then raise exception 'TASK_ROOM_MISMATCH'; end if;
 if staff='HOUSEKEEPING' and task.assigned_to is not null and task.assigned_to<>auth.uid() then raise exception 'TASK_ASSIGNED_TO_OTHER' using errcode='42501'; end if;
 if p_action='ASSIGN' then
  if staff='HOUSEKEEPING' and p_assignee is distinct from auth.uid() then raise exception 'NOT_AUTHORIZED' using errcode='42501'; end if;
  if p_assignee is not null then
   select full_name into assignee_name_value from public.profiles where id=p_assignee and is_active and role='HOUSEKEEPING' for share;
   if not found then raise exception 'ASSIGNEE_UNAVAILABLE'; end if;
  end if;
  update public.housekeeping_tasks set assigned_to=p_assignee,assignee_name=assignee_name_value,
   version=version+1,updated_at=clock_timestamp() where id=p_id;
  insert into public.housekeeping_activity(task_id,user_id,action,status,assignee_name,note)
  values(p_id,auth.uid(),'ASSIGNED',task.status,assignee_name_value,btrim(p_note));
 elsif p_action='NOTE' then
  if length(btrim(p_note))<1 then raise exception 'NOTE_REQUIRED'; end if;
  if staff='HOUSEKEEPING' and task.assigned_to is distinct from auth.uid() then raise exception 'CLAIM_TASK_FIRST' using errcode='42501'; end if;
  update public.housekeeping_tasks set version=version+1,updated_at=clock_timestamp() where id=p_id;
  insert into public.housekeeping_activity(task_id,user_id,action,status,note,assignee_name)
  values(p_id,auth.uid(),'NOTE',task.status,btrim(p_note),task.assignee_name);
 else
  next_status:=case task.status when 'DIRTY' then 'CLEANING'::public.room_status when 'CLEANING' then 'CLEAN'::public.room_status
   when 'CLEAN' then 'INSPECTED'::public.room_status when 'INSPECTED' then 'AVAILABLE'::public.room_status else null end;
  if next_status is null then raise exception 'TASK_CLOSED'; end if;
  update public.rooms set status=next_status where id=room.id;
  if length(btrim(p_note))>0 then
   insert into public.housekeeping_activity(task_id,user_id,action,status,note,assignee_name)
   select id,auth.uid(),'NOTE',status,btrim(p_note),assignee_name from public.housekeeping_tasks where id=p_id;
  end if;
 end if;
 return p_id;
end; $$;
revoke all on function public.update_housekeeping_task(uuid,integer,text,uuid,text) from public,anon;
grant execute on function public.update_housekeeping_task(uuid,integer,text,uuid,text) to authenticated;
commit;
