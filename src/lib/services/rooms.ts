import "server-only";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/services/auth";
import { roomReadRoles, roomManageRoles, roomStatuses } from "@/lib/rooms";

export async function getRoomTypes() {
  const { supabase } = await requireRole(roomReadRoles);
  const { data, error, count } = await supabase
    .from("room_types")
    .select("*", { count: "exact" })
    .order("name")
    .range(0, 999);
  if (error)
    throw new Error(
      "Room types could not be loaded. Apply the room migration and retry.",
    );
  if ((count ?? 0) > 1000)
    throw new Error("Too many room types. Contact your administrator.");
  return data ?? [];
}
export type RoomSearch = {
  q: string;
  status: string;
  type: string;
  active: string;
  sort: string;
  page: number;
  view: string;
};
export function parseRoomSearch(
  params: Record<string, string | string[] | undefined>,
): RoomSearch {
  const text = (key: string) =>
    typeof params[key] === "string" ? (params[key] as string) : "";
  const parsedPage = Number(text("page"));
  return {
    q: text("q").trim().slice(0, 80),
    status: roomStatuses.includes(
      text("status") as (typeof roomStatuses)[number],
    )
      ? text("status")
      : "",
    type: z.uuid().safeParse(text("type")).success ? text("type") : "",
    active: ["all", "inactive"].includes(text("active"))
      ? text("active")
      : "active",
    sort: ["floor", "status", "updated_at"].includes(text("sort"))
      ? text("sort")
      : "room_number",
    page:
      Number.isInteger(parsedPage) && parsedPage > 0
        ? Math.min(parsedPage, 10000)
        : 1,
    view: text("view") === "table" ? "table" : "board",
  };
}
export async function listRooms(search: RoomSearch) {
  const { supabase } = await requireRole(roomReadRoles);
  let query = supabase.from("rooms").select("*", { count: "exact" });
  if (search.q)
    query = query.ilike(
      "room_number",
      "%" + search.q.replace(/[\\%_]/g, "\\$&") + "%",
    );
  if (search.status)
    query = query.eq("status", search.status as (typeof roomStatuses)[number]);
  if (search.type) query = query.eq("room_type_id", search.type);
  if (search.active !== "all")
    query = query.eq("is_active", search.active === "active");
  const { data, error, count } = await query
    .order(search.sort, { ascending: search.sort !== "updated_at" })
    .order("id")
    .range((search.page - 1) * 24, search.page * 24 - 1);
  if (error)
    throw new Error(
      "Rooms could not be loaded. Apply the room migration and retry.",
    );
  return { rooms: data ?? [], count: count ?? 0 };
}
export async function getRoom(id: string) {
  if (!z.uuid().safeParse(id).success) notFound();
  const { supabase } = await requireRole(roomReadRoles);
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Room could not be loaded.");
  if (!data) notFound();
  return data;
}
export async function getRoomType(id: string) {
  if (!z.uuid().safeParse(id).success) notFound();
  const { supabase } = await requireRole(roomManageRoles);
  const { data, error } = await supabase
    .from("room_types")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Room type could not be loaded.");
  if (!data) notFound();
  return data;
}
export async function getRoomHistory(id: string) {
  const { supabase } = await requireRole(roomReadRoles);
  const { data, error } = await supabase
    .from("room_activity")
    .select("*")
    .eq("entity_type", "rooms")
    .eq("entity_id", id)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error("Room history could not be loaded.");
  return data ?? [];
}
