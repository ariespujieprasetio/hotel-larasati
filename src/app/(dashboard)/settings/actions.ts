"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireRole } from "@/lib/services/auth";
import { hotelSettingsSchema } from "@/lib/validations/hotel-settings";
export async function saveHotelSettings(
  input: unknown,
): Promise<{ ok: true } | { error: string }> {
  try {
    const { supabase } = await requireRole(["OWNER", "MANAGER"]);
    const parsed = hotelSettingsSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const { version, ...values } = parsed.data;
    const { data, error } = await supabase
      .from("hotel_settings")
      .update(values)
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .eq("version", version)
      .select("id")
      .maybeSingle();
    if (error)
      return {
        error:
          "Settings could not be saved. Check the settings migration and try again.",
      };
    if (!data)
      return {
        error:
          "Settings changed in another session. Reload this page and review before saving.",
      };
    for (const path of ["/settings", "/dashboard", "/folios", "/reservations"])
      revalidatePath(path, "layout");
    return { ok: true };
  } catch (e) {
    unstable_rethrow(e);
    return { error: "Unable to save settings. Reload and try again." };
  }
}
