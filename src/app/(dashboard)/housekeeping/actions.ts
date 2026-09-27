"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireRole } from "@/lib/services/auth";
import { housekeepingWriteRoles } from "@/lib/housekeeping";
import { housekeepingActionSchema } from "@/lib/validations/housekeeping";
export async function updateHousekeeping(
  input: unknown,
): Promise<{ ok: true } | { error: string }> {
  try {
    const { supabase } = await requireRole(housekeepingWriteRoles);
    const parsed = housekeepingActionSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const v = parsed.data;
    const { error } = await supabase.rpc("update_housekeeping_task", {
      p_id: v.id,
      p_version: v.version,
      p_action: v.action,
      p_assignee: v.assignee,
      p_note: v.note,
    });
    if (error) {
      const messages: Record<string, string> = {
        TASK_ASSIGNED_TO_OTHER:
          "This task belongs to another staff member. Ask management to reassign it.",
        TASK_CLOSED:
          "This task is already closed. Reload to see the latest room status.",
        STALE_TASK:
          "The task changed since you opened it. Reload before saving.",
        TASK_ROOM_MISMATCH: "Room readiness changed. Reload the task.",
        ROOM_CHANGED: "The room changed. Reload and try again.",
        ASSIGNEE_UNAVAILABLE: "Select an active housekeeping staff member.",
        CLAIM_TASK_FIRST: "Take the task before adding a note.",
        NOTE_REQUIRED: "Enter a note before saving.",
      };
      return {
        error:
          messages[error.message] ??
          "The task could not be updated. Reload and try again.",
      };
    }
    for (const p of ["/housekeeping", "/rooms", "/check-in", "/reservations"])
      revalidatePath(p, "layout");
    return { ok: true };
  } catch (e) {
    unstable_rethrow(e);
    return { error: "Unable to update housekeeping. Please try again." };
  }
}
