"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireRole } from "@/lib/services/auth";
export async function moveRoom(input: {
  reservationId: string;
  version: number;
  roomId: string;
  reason: string;
}) {
  try {
    const { supabase } = await requireRole([
      "OWNER",
      "MANAGER",
      "FRONT_OFFICE",
    ]);
    const { error } = await supabase.rpc("move_checked_in_guest", {
      p_reservation: input.reservationId,
      p_version: input.version,
      p_room: input.roomId,
      p_reason: input.reason,
    });
    if (error) {
      const messages: Record<string, string> = {
        ROOM_NOT_READY: "The selected room is not ready.",
        ROOM_ALREADY_OCCUPIED: "The selected room is occupied.",
        ROOM_HAS_RESERVATION:
          "The selected room has an overlapping reservation.",
        ROOM_TYPE_MISMATCH: "Choose a room with the same room type.",
        STALE_OR_NOT_CHECKED_IN: "The stay changed. Reload and try again.",
        SAME_ROOM: "Choose a different room.",
      };
      return {
        error:
          messages[error.message] ??
          "Unable to move the guest. Reload and try again.",
      };
    }
    for (const path of [
      "/in-house",
      "/rooms",
      "/folios",
      "/check-out",
      "/reservations",
    ])
      revalidatePath(path, "layout");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    return { error: "Unable to move the guest. Reload and try again." };
  }
}
