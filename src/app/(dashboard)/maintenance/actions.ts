"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireRole } from "@/lib/services/auth";
const report = z.object({
  requestId: z.uuid(),
  room: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9-]{1,12}$/),
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(3).max(2000),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
});
const update = z.object({
  id: z.uuid(),
  version: z.number().int().positive(),
  action: z.enum(["ASSIGN", "START", "COMPLETE", "CANCEL", "NOTE"]),
  assignee: z.union([z.uuid(), z.literal("")]),
  note: z.string().trim().max(1800),
});
const messages: Record<string, string> = {
  STALE_TASK: "Task changed. Reload before continuing.",
  TASK_CLOSED: "This task is already closed.",
  NOTE_REQUIRED: "Enter a note with at least three characters.",
  ASSIGNEE_UNAVAILABLE: "Select an active staff member.",
  INVALID_TRANSITION: "Start the task before completing it.",
  REQUEST_CONFLICT:
    "This request was used for different details. Check the task list before retrying.",
  NOT_AUTHORIZED: "Your role or assignment does not allow this change.",
};
export async function createMaintenance(
  input: unknown,
): Promise<{ id: string } | { error: string }> {
  try {
    const { supabase } = await requireRole([
      "OWNER",
      "MANAGER",
      "FRONT_OFFICE",
      "HOUSEKEEPING",
    ]);
    const p = report.safeParse(input);
    if (!p.success) return { error: p.error.issues[0].message };
    const v = p.data;
    const room = await supabase
      .from("rooms")
      .select("id")
      .ilike("room_number", v.room)
      .eq("is_active", true)
      .maybeSingle();
    if (room.error || !room.data)
      return { error: "Active room not found. Enter its exact room number." };
    const { data, error } = await supabase.rpc("create_maintenance", {
      p_request: v.requestId,
      p_room: room.data.id,
      p_title: v.title,
      p_description: v.description,
      p_priority: v.priority,
    });
    if (error)
      return {
        error:
          messages[error.message] ??
          "Report could not be saved. Check the migration and retry.",
      };
    revalidatePath("/maintenance", "layout");
    return { id: data };
  } catch (e) {
    unstable_rethrow(e);
    return {
      error:
        "Unable to confirm report. Retry the same details or check the task list.",
    };
  }
}
export async function updateMaintenance(
  input: unknown,
): Promise<{ ok: true } | { error: string }> {
  try {
    const { supabase } = await requireRole([
      "OWNER",
      "MANAGER",
      "HOUSEKEEPING",
    ]);
    const p = update.safeParse(input);
    if (!p.success) return { error: p.error.issues[0].message };
    const v = p.data;
    const { error } = await supabase.rpc("update_maintenance", {
      p_id: v.id,
      p_version: v.version,
      p_action: v.action,
      p_assignee: v.assignee || null,
      p_note: v.note,
    });
    if (error)
      return {
        error:
          messages[error.message] ??
          "Task could not be changed. Reload and try again.",
      };
    revalidatePath("/maintenance", "layout");
    return { ok: true };
  } catch (e) {
    unstable_rethrow(e);
    return {
      error: "Unable to confirm update. Reload to review task history.",
    };
  }
}
