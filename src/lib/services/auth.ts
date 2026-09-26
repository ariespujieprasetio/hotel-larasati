import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Role } from "@/types/database";

export const requireStaff = cache(async () => {
  if (!getSupabaseConfig()) redirect("/login");
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError)
    throw new Error(
      "Your staff profile could not be loaded. Contact your administrator.",
    );
  if (!profile?.is_active) redirect("/access-denied");
  return { supabase, profile };
});
export async function requireRole(allowed: readonly Role[]) {
  const staff = await requireStaff();
  if (!allowed.includes(staff.profile.role))
    throw new Error("You do not have permission to perform this action.");
  return staff;
}
