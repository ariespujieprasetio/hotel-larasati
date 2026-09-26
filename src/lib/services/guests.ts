import "server-only";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/services/auth";
import { guestRoles } from "@/lib/guests";
import { parseGuestSearch } from "@/lib/validations/guests";
export async function listGuests(search: ReturnType<typeof parseGuestSearch>) {
  const { supabase } = await requireRole(guestRoles);
  // Do not include full identity numbers or personal notes in the list payload.
  let query = supabase
    .from("guests")
    .select("id,guest_code,full_name,phone,email,nationality,is_active", {
      count: "exact",
    });
  if (search.q)
    query = query.ilike(
      search.field,
      "%" + search.q.replace(/[\\%_]/g, "\\$&") + "%",
    );
  if (search.active !== "all")
    query = query.eq("is_active", search.active === "active");
  const { data, error, count } = await query
    .order(search.sort, { ascending: search.sort !== "created_at" })
    .order("id")
    .range((search.page - 1) * 20, search.page * 20 - 1);
  if (error) throw new Error("Guest data could not be loaded.");
  return { guests: data ?? [], count: count ?? 0 };
}
export async function getGuest(id: string) {
  if (!z.uuid().safeParse(id).success) notFound();
  const { supabase } = await requireRole(guestRoles);
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Guest data could not be loaded.");
  if (!data) notFound();
  return data;
}
export async function getGuestActivity(id: string) {
  const { supabase } = await requireRole(guestRoles);
  const { data, error } = await supabase
    .from("guest_activity")
    .select("*")
    .eq("guest_id", id)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error("Guest activity could not be loaded.");
  return data ?? [];
}
