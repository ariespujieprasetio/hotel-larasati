import "server-only";
import { z } from "zod";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/services/auth";
import { reservationRoles, reservationStatuses } from "@/lib/reservations";
export async function getReservation(id: string) {
  if (!z.uuid().safeParse(id).success) notFound();
  const { supabase } = await requireRole(reservationRoles);
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Reservation data could not be loaded.");
  if (!data) notFound();
  return data;
}
export async function getReservationContext(id: string) {
  const reservation = await getReservation(id);
  const { supabase } = await requireRole(reservationRoles);
  const results = await Promise.all([
    supabase
      .from("guests")
      .select("id,full_name,guest_code,phone")
      .eq("id", reservation.guest_id)
      .single(),
    supabase
      .from("rooms")
      .select("id,room_number,status")
      .eq("id", reservation.room_id)
      .single(),
    supabase
      .from("room_types")
      .select("name")
      .eq("id", reservation.room_type_id)
      .single(),
    supabase
      .from("reservation_activity")
      .select("*")
      .eq("reservation_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  if (results.some((r) => r.error))
    throw new Error("Reservation details could not be loaded.");
  return {
    reservation,
    guest: results[0].data!,
    room: results[1].data!,
    roomType: results[2].data!,
    activity: results[3].data ?? [],
  };
}
export function parseReservationSearch(
  params: Record<string, string | string[] | undefined>,
) {
  const get = (key: string) =>
    typeof params[key] === "string" ? (params[key] as string) : "";
  const n = Number(get("page"));
  return {
    q: get("q").trim().slice(0, 80),
    status: z
      .enum(reservationStatuses)
      .or(z.literal(""))
      .catch("")
      .parse(get("status")),
    from: z.iso.date().or(z.literal("")).catch("").parse(get("from")),
    to: z.iso.date().or(z.literal("")).catch("").parse(get("to")),
    page: Number.isInteger(n) && n > 0 ? Math.min(n, 10000) : 1,
    sort: get("sort") === "created_at" ? "created_at" : "check_in_date",
  };
}
export async function listReservations(
  search: ReturnType<typeof parseReservationSearch>,
) {
  const { supabase } = await requireRole(reservationRoles);
  let query = supabase.from("reservations").select("*", { count: "exact" });
  if (search.q)
    query = query.ilike(
      "reservation_number",
      "%" + search.q.replace(/[\\%_]/g, "\\$&") + "%",
    );
  if (search.status) query = query.eq("status", search.status);
  if (search.from) query = query.gte("check_in_date", search.from);
  if (search.to) query = query.lte("check_in_date", search.to);
  const { data, error, count } = await query
    .order(search.sort, { ascending: search.sort === "check_in_date" })
    .order("id")
    .range((search.page - 1) * 20, search.page * 20 - 1);
  if (error) throw new Error("Reservations could not be loaded.");
  const reservations = data ?? [];
  if (!reservations.length)
    return { reservations, guests: [], rooms: [], count: count ?? 0 };
  const [guests, rooms] = await Promise.all([
    supabase
      .from("guests")
      .select("id,full_name")
      .in("id", [...new Set(reservations.map((r) => r.guest_id))]),
    supabase
      .from("rooms")
      .select("id,room_number")
      .in("id", [...new Set(reservations.map((r) => r.room_id))]),
  ]);
  if (guests.error || rooms.error)
    throw new Error("Reservation names could not be loaded.");
  return {
    reservations,
    guests: guests.data ?? [],
    rooms: rooms.data ?? [],
    count: count ?? 0,
  };
}
export async function guestReservationHistory(guestId: string) {
  const { supabase } = await requireRole(reservationRoles);
  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id,reservation_number,check_in_date,check_out_date,status,total_amount,currency",
    )
    .eq("guest_id", guestId)
    .order("check_in_date", { ascending: false })
    .limit(10);
  if (error) return { data: [], unavailable: true };
  return { data: data ?? [], unavailable: false };
}
