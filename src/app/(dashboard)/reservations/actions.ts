"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/services/auth";
import { reservationRoles } from "@/lib/reservations";
import {
  previewSchema,
  reservationSchema,
  reservationStatusSchema,
} from "@/lib/validations/reservations";
import type { ReservationPreview, GuestOption } from "@/types/reservations";
function message(error: { code?: string; message: string }) {
  const errors: Record<string, string> = {
    ROOM_UNAVAILABLE:
      "The selected room is no longer available. Check availability again.",
    QUOTE_CHANGED:
      "Rates or hotel charges changed. Check availability again before saving.",
    STALE_RESERVATION:
      "Another staff member changed this reservation. Reload before saving.",
    CAPACITY_EXCEEDED: "The guest count exceeds the room type capacity.",
    DISCOUNT_REQUIRES_MANAGER:
      "Only an owner or manager can change the discount.",
    DISCOUNT_TOO_LARGE: "The discount cannot exceed the room subtotal.",
    GUEST_INACTIVE: "Select an active guest.",
    ROOM_TYPE_INACTIVE: "Select an active room type.",
    ARRIVAL_IN_PAST: "A new arrival date cannot be in the past.",
    RESERVATION_NOT_EDITABLE: "This reservation can no longer be edited.",
    NO_SHOW_TOO_EARLY:
      "No-show is only available on or after the arrival date.",
    REASON_REQUIRED: "Enter a reason with at least 3 characters.",
    INVALID_STATUS: "That status transition is not permitted.",
    AMOUNT_TOO_LARGE: "The total exceeds the supported amount.",
  };
  if (error.code === "23P01") return errors.ROOM_UNAVAILABLE;
  if (error.code === "40P01" || error.code === "40001")
    return "Another operation changed inventory. Please check availability and retry.";
  if (error.code === "42501")
    return (
      errors[error.message] ??
      "You do not have permission to perform this action."
    );
  return (
    errors[error.message] ??
    "The request could not be completed. Check the details and database setup."
  );
}
export async function previewReservation(
  input: unknown,
): Promise<{ data: ReservationPreview } | { error: string }> {
  try {
    const { supabase } = await requireRole(reservationRoles);
    const parsed = previewSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const { data, error } = await supabase.rpc("reservation_preview", {
      p_data: parsed.data,
    });
    if (error) return { error: message(error) };
    return { data };
  } catch (e) {
    unstable_rethrow(e);
    return { error: "Unable to check availability. Please try again." };
  }
}
export async function saveReservation(
  input: unknown,
): Promise<{ id: string } | { error: string }> {
  try {
    const { supabase } = await requireRole(reservationRoles);
    const parsed = reservationSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const { data, error } = await supabase.rpc("save_reservation", {
      p_data: parsed.data,
    });
    if (error) return { error: message(error) };
    revalidatePath("/reservations", "layout");
    revalidatePath("/guests", "layout");
    revalidatePath("/dashboard");
    return { id: data };
  } catch (e) {
    unstable_rethrow(e);
    return { error: "Unable to save the reservation. Please try again." };
  }
}
export async function updateReservationStatus(
  input: unknown,
): Promise<{ id: string } | { error: string }> {
  try {
    const { supabase } = await requireRole(reservationRoles);
    const parsed = reservationStatusSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const { id, version, status, reason } = parsed.data;
    const { data, error } = await supabase.rpc("set_reservation_status", {
      p_id: id,
      p_version: version,
      p_status: status,
      p_reason: reason,
    });
    if (error) return { error: message(error) };
    revalidatePath("/reservations", "layout");
    revalidatePath("/guests", "layout");
    revalidatePath("/dashboard");
    return { id: data };
  } catch (e) {
    unstable_rethrow(e);
    return { error: "Unable to update the reservation." };
  }
}
export async function searchReservationGuests(
  input: unknown,
): Promise<{ data: GuestOption[] } | { error: string }> {
  try {
    const { supabase } = await requireRole(reservationRoles);
    const parsed = z
      .object({
        q: z.string().trim().min(2).max(150),
        field: z.enum(["full_name", "guest_code", "phone"]),
      })
      .safeParse(input);
    if (!parsed.success)
      return { error: "Enter at least two characters to find a guest." };
    const { data, error } = await supabase
      .from("guests")
      .select("id,full_name,guest_code,phone")
      .eq("is_active", true)
      .ilike(
        parsed.data.field,
        "%" + parsed.data.q.replace(/[\\%_]/g, "\\$&") + "%",
      )
      .order("full_name")
      .limit(20);
    if (error) return { error: "Guest search failed." };
    return { data: data ?? [] };
  } catch (e) {
    unstable_rethrow(e);
    return { error: "Unable to search guests." };
  }
}
