"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireRole } from "@/lib/services/auth";
import { reservationRoles } from "@/lib/reservations";
export async function checkIn(
  input: unknown,
): Promise<{ ok: true } | { error: string }> {
  try {
    const { supabase } = await requireRole(reservationRoles);
    const parsed = z
      .object({ id: z.uuid(), version: z.number().int().positive() })
      .safeParse(input);
    if (!parsed.success)
      return { error: "Invalid reservation. Reload and try again." };
    const { error } = await supabase.rpc("check_in_reservation", {
      p_id: parsed.data.id,
      p_version: parsed.data.version,
    });
    if (error) {
      const messages: Record<string, string> = {
        STALE_RESERVATION:
          "This reservation changed. Reload before checking in.",
        CHECK_IN_REQUIRES_CONFIRMED: "Confirm the reservation before check-in.",
        CHECK_IN_DATE_INVALID:
          "Check-in is allowed from the arrival date until the day before departure (WIB). Edit the booking dates if needed.",
        ROOM_NOT_READY:
          "The room must be AVAILABLE or INSPECTED. Complete cleaning first.",
        ROOM_ALREADY_OCCUPIED: "The previous guest still occupies this room.",
        ROOM_UNAVAILABLE:
          "The assigned room is unavailable. Review the booking.",
        ROOM_TYPE_INACTIVE:
          "The room type is inactive or its capacity is insufficient.",
        GUEST_INACTIVE: "Activate the guest record before check-in.",
      };
      return {
        error:
          messages[error.message] ??
          "Check-in could not be completed. Reload and try again.",
      };
    }
    for (const path of [
      "/reservations",
      "/rooms",
      "/guests",
      "/check-in",
      "/in-house",
    ])
      revalidatePath(path, "layout");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    return { error: "Unable to check in. Please try again." };
  }
}
