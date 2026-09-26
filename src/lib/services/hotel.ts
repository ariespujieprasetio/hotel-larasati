import "server-only";
import { requireStaff } from "@/lib/services/auth";
export async function getHotelSettings() {
  const { supabase } = await requireStaff();
  const { data, error } = await supabase
    .from("hotel_settings")
    .select("*")
    .single();
  if (error)
    throw new Error(
      "Hotel settings could not be loaded. Check that the initial migration has been applied.",
    );
  return data;
}
