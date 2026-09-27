import "server-only";
import { z } from "zod";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/services/auth";
import {
  housekeepingReadRoles,
  housekeepingStatuses,
} from "@/lib/housekeeping";
export function parseHousekeepingSearch(
  params: Record<string, string | string[] | undefined>,
) {
  const text = (key: string) =>
    typeof params[key] === "string" ? (params[key] as string) : "";
  const n = Number(text("page"));
  return {
    page: Number.isInteger(n) && n > 0 ? Math.min(n, 10000) : 1,
    q: text("q").trim().slice(0, 12),
    status: z
      .enum([...housekeepingStatuses, "active"])
      .catch("active")
      .parse(text("status")),
    assignment: ["mine", "unassigned"].includes(text("assignment"))
      ? text("assignment")
      : "all",
  };
}
export async function listHousekeeping(
  search: ReturnType<typeof parseHousekeepingSearch>,
) {
  const { supabase, profile } = await requireRole(housekeepingReadRoles);
  let query = supabase
    .from("housekeeping_tasks")
    .select("*", { count: "exact" });
  if (search.status === "active") query = query.is("closed_at", null);
  else query = query.eq("status", search.status);
  if (search.assignment === "mine") query = query.eq("assigned_to", profile.id);
  if (search.assignment === "unassigned") query = query.is("assigned_to", null);
  if (search.q)
    query = query.ilike(
      "room_number",
      "%" + search.q.replace(/[\\%_]/g, "\\$&") + "%",
    );
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .order("id")
    .range((search.page - 1) * 20, search.page * 20 - 1);
  if (error) throw new Error("Housekeeping tasks could not be loaded.");
  return { tasks: data ?? [], count: count ?? 0 };
}
export async function getHousekeepingTask(id: string) {
  if (!z.uuid().safeParse(id).success) notFound();
  const { supabase, profile } = await requireRole(housekeepingReadRoles);
  const { data: task, error } = await supabase
    .from("housekeeping_tasks")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Housekeeping task could not be loaded.");
  if (!task) notFound();
  const [room, activity] = await Promise.all([
    supabase
      .from("rooms")
      .select("id,room_number,status,is_active")
      .eq("id", task.room_id)
      .single(),
    supabase
      .from("housekeeping_activity")
      .select("*", { count: "exact" })
      .eq("task_id", id)
      .order("created_at", { ascending: false })
      .order("id")
      .limit(50),
  ]);
  if (room.error || activity.error)
    throw new Error("Task details could not be loaded.");
  const roster = ["OWNER", "MANAGER"].includes(profile.role)
    ? await supabase.rpc("housekeeping_staff")
    : { data: [], error: null };
  if (roster.error) throw new Error("Housekeeping staff could not be loaded.");
  return {
    task,
    room: room.data,
    activity: activity.data ?? [],
    activityCount: activity.count ?? 0,
    staff: roster.data ?? [],
    profile,
  };
}
