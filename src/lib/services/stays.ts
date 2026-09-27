import "server-only";
import { requireRole } from "@/lib/services/auth";
import { reservationRoles } from "@/lib/reservations";
export async function listStays(page: number) {
  const { supabase } = await requireRole(reservationRoles);
  const { data, error, count } = await supabase
    .from("stays")
    .select("*", { count: "exact" })
    .is("checked_out_at", null)
    .order("checked_in_at", { ascending: false })
    .order("id")
    .range((page - 1) * 20, page * 20 - 1);
  if (error)
    throw new Error(
      "In-house guests could not be loaded. Check that the check-in migration has been applied.",
    );
  const stays = data ?? [];
  if (!stays.length)
    return { stays, bookings: [], guests: [], rooms: [], count: count ?? 0 };
  const bookings = await supabase
    .from("reservations")
    .select("*")
    .in(
      "id",
      stays.map((s) => s.reservation_id),
    );
  if (bookings.error) throw new Error("Stay reservations could not be loaded.");
  const rows = bookings.data ?? [];
  const [guests, rooms] = await Promise.all([
    supabase
      .from("guests")
      .select("id,full_name")
      .in(
        "id",
        rows.map((r) => r.guest_id),
      ),
    supabase
      .from("rooms")
      .select("id,room_number")
      .in(
        "id",
        stays.map((s) => s.room_id),
      ),
  ]);
  if (guests.error || rooms.error)
    throw new Error("Stay details could not be loaded.");
  return {
    stays,
    bookings: rows,
    guests: guests.data ?? [],
    rooms: rooms.data ?? [],
    count: count ?? 0,
  };
}
