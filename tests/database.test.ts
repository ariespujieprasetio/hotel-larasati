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
      ])
        await runSql("supabase/tests/" + name);
    } finally {
      await db.close();
    }
  },
);
