"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireStaff } from "@/lib/services/auth";
import { guestRoles } from "@/lib/guests";
import { guestSchema } from "@/lib/validations/guests";
export async function saveGuest(
  input: unknown,
): Promise<{ id: string } | { error: string }> {
  try {
    const { supabase, profile } = await requireStaff();
    if (!guestRoles.includes(profile.role))
      return { error: "You do not have permission to manage guests." };
    const parsed = guestSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const { id, version, date_of_birth, ...rest } = parsed.data;
    const values = {
      ...rest,
      date_of_birth: date_of_birth || null,
      email: rest.email.toLowerCase(),
      id_number: rest.id_number.toUpperCase(),
    };
    const query = id
      ? supabase
          .from("guests")
          .update(values)
          .eq("id", id)
          .eq("version", version!)
      : supabase.from("guests").insert(values);
    const { data, error } = await query.select("id").maybeSingle();
    if (error) {
      if (error.message.includes("GUEST_HAS_RESERVATIONS"))
        return {
          error:
            "Cancel or complete active reservations before deactivating this guest.",
        };
      if (error.code === "23505")
        return {
          error:
            "A guest with this identity type and number already exists. Search existing and inactive guests.",
        };
      if (error.code === "42501")
        return { error: "You do not have permission to manage guests." };
      if (error.code === "23514")
        return {
          error: "Check the guest details, identity number and birth date.",
        };
      return {
        error:
          "Guest could not be saved. Check the connection and database setup.",
      };
    }
    if (!data)
      return {
        error:
          "This guest was changed by another staff member. Reload before saving.",
      };
    revalidatePath("/guests", "layout");
    return { id: data.id };
  } catch (error) {
    unstable_rethrow(error);
    return { error: "Unable to save the guest. Please try again." };
  }
}
