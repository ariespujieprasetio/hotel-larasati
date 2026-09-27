import "server-only";
import { z } from "zod";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/services/auth";
import { staffRoles, staffReadRoles } from "@/lib/staff";
export function parseStaffSearch(
  params: Record<string, string | string[] | undefined>,
) {
  const text = (key: string) =>
    typeof params[key] === "string" ? (params[key] as string) : "";
  const n = Number(text("page"));
  return {
    q: text("q").trim().slice(0, 150),
    role: z
      .enum([...staffRoles, "all"])
      .catch("all")
      .parse(text("role")),
    active: ["active", "inactive"].includes(text("active"))
      ? text("active")
      : "all",
    page: Number.isInteger(n) && n > 0 ? Math.min(n, 10000) : 1,
  };
}
export async function listStaff(search: ReturnType<typeof parseStaffSearch>) {
  const { supabase, profile } = await requireRole(staffReadRoles);
  let query = supabase.from("profiles").select("*", { count: "exact" });
  if (search.q)
    query = query.ilike(
      "full_name",
      "%" + search.q.replace(/[\\%_]/g, "\\$&") + "%",
    );
  if (search.role !== "all") query = query.eq("role", search.role);
  if (search.active !== "all")
    query = query.eq("is_active", search.active === "active");
  const { data, error, count } = await query
    .order("full_name")
    .order("id")
    .range((search.page - 1) * 20, search.page * 20 - 1);
  if (error) throw new Error("Staff could not be loaded.");
  return { staff: data ?? [], count: count ?? 0, profile };
}
export async function getStaff(id: string) {
  if (!z.uuid().safeParse(id).success) notFound();
  const { supabase, profile } = await requireRole(staffReadRoles);
  const { data: staff, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Staff profile could not be loaded.");
  if (!staff) notFound();
  const activity = await supabase
    .from("staff_activity")
    .select("*", { count: "exact" })
    .eq("profile_id", id)
    .order("created_at", { ascending: false })
    .order("id")
    .limit(50);
  if (activity.error)
    throw new Error(
      "Staff activity could not be loaded. Apply the staff management migration.",
    );
  return {
    staff,
    profile,
    activity: activity.data ?? [],
    activityCount: activity.count ?? 0,
  };
}
