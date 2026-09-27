import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
export function hasStaffAdminConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SECRET_KEY?.trim(),
  );
}
export function createStaffAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !key)
    throw new Error("Staff account creation is not configured.");
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
