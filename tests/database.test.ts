import { test } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
test(
  "PostgreSQL migrations and all rollback permission suites",
  { timeout: 120000 },
  async () => {
    const db = new PGlite({ extensions: { btree_gist } });
    async function runSql(path: string) {
      try {
        const sql = (await readFile(path, "utf8")).replace(/^\uFEFF/, "");
        await db.exec(sql);
      } catch (error) {
        const detail =
          error instanceof Error ? error.message : "Unknown database failure";
        const where =
          error && typeof error === "object" && "where" in error
            ? String(error.where)
            : "";
        throw new Error(path + ": " + detail + " " + where);
      }
    }
    try {
      await db.exec(`
 create role anon; create role authenticated;
 create schema auth;
 create table auth.users(id uuid primary key default gen_random_uuid(),email text,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$
 select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
 $$;
 grant usage on schema auth,public to authenticated,anon;
 grant execute on function auth.uid() to authenticated,anon;
 `);
      const migrations = (await readdir("supabase/migrations"))
        .filter((p) => p.endsWith(".sql"))
        .sort();
      for (const name of migrations)
        await runSql("supabase/migrations/" + name);
      for (const name of [
        "foundation.sql",
        "rooms.sql",
        "guests.sql",
        "reservations.sql",
        "check_in.sql",
        "billing_checkout.sql",
        "housekeeping.sql",
        "staff.sql",
        "folio_extras.sql",
        "folio_print.sql",
      ])
        await runSql("supabase/tests/" + name);
    } finally {
      await db.close();
    }
  },
);

test(
  "Operational migrations backfill bills and cleaning jobs without changing occupancy",
  { timeout: 120000 },
  async () => {
    const db = new PGlite({ extensions: { btree_gist } });
    try {
      await db.exec(`
 create role anon; create role authenticated;
 create schema auth;
 create table auth.users(id uuid primary key default gen_random_uuid(),email text,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$
 select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
 $$;
 grant usage on schema auth,public to authenticated,anon;
 grant execute on function auth.uid() to authenticated,anon;
 `);
      const migrations = (await readdir("supabase/migrations"))
        .filter((p) => p.endsWith(".sql"))
        .sort();
      const billing = "202609270004_billing_checkout.sql";
      for (const name of migrations.filter((n) => n < billing))
        await db.exec(
          (await readFile("supabase/migrations/" + name, "utf8")).replace(
            /^\uFEFF/,
            "",
          ),
        );
      await db.exec(`
 insert into auth.users(id,email) values('70000000-0000-4000-8000-000000000001','migration@example.invalid');
 update public.profiles set is_active=true,role='OWNER';
 select set_config('request.jwt.claim.sub','70000000-0000-4000-8000-000000000001',false);
 insert into public.guests(id,full_name) values('70000000-0000-4000-8000-000000000010','Existing guest');
 insert into public.room_types(id,name,base_price,capacity,bed_type) values('70000000-0000-4000-8000-000000000020','Existing type',125000,2,'Twin');
 insert into public.rooms(room_number,room_type_id) values('EXIST-1','70000000-0000-4000-8000-000000000020');
 do $$
 declare booking uuid; d jsonb; today date:=(now() at time zone 'Asia/Jakarta')::date;
 begin
 d:=jsonb_build_object('guest_id','70000000-0000-4000-8000-000000000010','room_type_id','70000000-0000-4000-8000-000000000020',
 'check_in_date',today,'check_out_date',today+1,'adults',1,'children',0,'discount_amount',0,'source','DIRECT','status','CONFIRMED','expected_total',125000,'expected_currency','IDR');
 booking:=public.save_reservation(d);
 perform public.check_in_reservation(booking,1);
 end; $$;
 `);
      await db.exec(await readFile("supabase/migrations/" + billing, "utf8"));
      await db.exec(`
 do $$ begin
 if (select count(*) from public.folios)<>1 or not exists(select 1 from public.folios where guest_name='Existing guest' and total_amount=125000 and paid_amount=0 and balance=125000 and closed_at is null)
 then raise exception 'Existing guest folio incorrect'; end if;
 if exists(select 1 from public.payments) then raise exception 'Migration invented payment'; end if;
 if not exists(select 1 from public.rooms where status='OCCUPIED') then raise exception 'Migration changed occupancy'; end if;
 end; $$;
 `);

      await db.exec(`
 insert into public.rooms(room_number,room_type_id) values('DIRTY-2','70000000-0000-4000-8000-000000000020');
 update public.rooms set status='DIRTY' where room_number='DIRTY-2';
 `);
      await db.exec(
        await readFile(
          "supabase/migrations/202609270005_housekeeping.sql",
          "utf8",
        ),
      );
      await db.exec(`
 do $$ begin
 if (select count(*) from public.housekeeping_tasks)<>1 or not exists(select 1 from public.housekeeping_tasks where room_number='DIRTY-2' and status='DIRTY' and assigned_to is null and closed_at is null)
 then raise exception 'Existing cleaning task not imported'; end if;
 if exists(select 1 from public.housekeeping_tasks where room_number='EXIST-1') then raise exception 'Occupied room given cleaning job'; end if;
 if (select count(*) from public.housekeeping_activity)<>1 then raise exception 'Backfill invented cleaning history'; end if;
 end; $$;
 `);

      await db.exec(
        await readFile(
          "supabase/migrations/202609270006_staff_management.sql",
          "utf8",
        ),
      );
      await db.exec(`
 do $$ begin
 if (select active_owners from public.staff_owner_guard)<>1 then raise exception 'Existing owner count incorrect'; end if;
 begin
 perform public.update_staff_profile(auth.uid(),1,'Existing owner','','OWNER',false);
 raise exception 'Existing last owner was disabled';
 exception when raise_exception then if sqlerrm<>'LAST_ACTIVE_OWNER' then raise; end if; end;
 end; $$;
 `);
    } finally {
      await db.close();
    }
  },
);
