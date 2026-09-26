"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import type { PostgrestError } from "@supabase/supabase-js";
import { requireStaff } from "@/lib/services/auth";
import { roomManageRoles, statusOptions } from "@/lib/rooms";
import {
  roomSchema,
  roomTypeSchema,
  roomStatusSchema,
} from "@/lib/validations/rooms";
export type SaveResult = { error: string } | { id: string };
function databaseError(error: PostgrestError): string {
  if (error.message.includes("ROOM_HAS_RESERVATIONS"))
    return "Reassign or cancel active reservations before blocking or changing this room.";
  if (error.message.includes("CAPACITY_HAS_RESERVATIONS"))
    return "Existing bookings exceed this capacity. Reassign them first.";
  if (error.code === "23505")
    return "That room number or room type name already exists, including inactive records.";
  if (error.message.includes("ROOM_TYPE_IN_USE"))
    return "Deactivate or reassign active rooms before deactivating this type.";
  if (error.message.includes("ROOM_TYPE_INACTIVE"))
    return "Choose an active room type before activating this room.";
  if (error.message.includes("ROOM_STAY_MANAGED"))
    return "Occupied and reserved statuses are managed by reservation workflows.";
  if (error.message.includes("ROOM_INVALID_TRANSITION"))
    return "This cleaning step is no longer available. Reload the room.";
  if (error.code === "42501")
    return "You do not have permission to perform this action.";
  if (error.code === "23514" || error.code === "23503")
    return "Check the entered values and selected room type.";
  return "The change could not be saved. Check the database setup and try again.";
}
function refreshRooms(id?: string) {
  revalidatePath("/rooms", "layout");
  if (id) revalidatePath("/rooms/" + id);
}
export async function saveRoom(input: unknown): Promise<SaveResult> {
  try {
    const { supabase, profile } = await requireStaff();
    if (!roomManageRoles.includes(profile.role))
      return { error: "You do not have permission to edit rooms." };
    const parsed = roomSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const { id, version, ...values } = parsed.data;
    const query = id
      ? supabase
          .from("rooms")
          .update(values)
          .eq("id", id)
          .eq("version", version!)
      : supabase.from("rooms").insert(values);
    const { data, error } = await query.select("id").maybeSingle();
    if (error) return { error: databaseError(error) };
    if (!data)
      return {
        error: "This room changed since you opened it. Reload before saving.",
      };
    refreshRooms(data.id);
    return { id: data.id };
  } catch (error) {
    unstable_rethrow(error);
    return { error: "Unable to save the room. Please try again." };
  }
}
export async function saveRoomType(input: unknown): Promise<SaveResult> {
  try {
    const { supabase, profile } = await requireStaff();
    if (!roomManageRoles.includes(profile.role))
      return { error: "You do not have permission to edit room types." };
    const parsed = roomTypeSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const { id, version, amenities, size, ...rest } = parsed.data;
    const values = {
      ...rest,
      size: size || null,
      amenities: [
        ...new Set(
          amenities
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean),
        ),
      ],
    };
    const query = id
      ? supabase
          .from("room_types")
          .update(values)
          .eq("id", id)
          .eq("version", version!)
      : supabase.from("room_types").insert(values);
    const { data, error } = await query.select("id").maybeSingle();
    if (error) return { error: databaseError(error) };
    if (!data)
      return {
        error:
          "This room type changed since you opened it. Reload before saving.",
      };
    refreshRooms();
    return { id: data.id };
  } catch (error) {
    unstable_rethrow(error);
    return { error: "Unable to save the room type. Please try again." };
  }
}
export async function changeRoomStatus(input: unknown): Promise<SaveResult> {
  try {
    const { supabase, profile } = await requireStaff();
    const parsed = roomStatusSchema.safeParse(input);
    if (!parsed.success) return { error: "Select a valid room and status." };
    const { id, version, status } = parsed.data;
    const { data: room, error: readError } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (readError || !room)
      return { error: "Room is unavailable or you do not have access." };
    if (
      !room.is_active ||
      !statusOptions(room.status, profile.role).includes(status)
    )
      return { error: "This status change is not permitted." };
    const { data, error } = await supabase
      .from("rooms")
      .update({ status })
      .eq("id", id)
      .eq("version", version)
      .select("id")
      .maybeSingle();
    if (error) return { error: databaseError(error) };
    if (!data)
      return {
        error:
          "Another staff member changed this room. Reload to see its latest status.",
      };
    refreshRooms(id);
    return { id };
  } catch (error) {
    unstable_rethrow(error);
    return { error: "Unable to update the room status. Please try again." };
  }
}
