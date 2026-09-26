import type { Role } from "@/types/database";
export const roomStatuses = [
  "AVAILABLE",
  "OCCUPIED",
  "RESERVED",
  "DIRTY",
  "CLEANING",
  "CLEAN",
  "INSPECTED",
  "OUT_OF_ORDER",
  "MAINTENANCE",
] as const;
export type RoomStatus = (typeof roomStatuses)[number];
export const roomReadRoles: readonly Role[] = [
  "OWNER",
  "MANAGER",
  "FRONT_OFFICE",
  "HOUSEKEEPING",
];
export const roomManageRoles: readonly Role[] = ["OWNER", "MANAGER"];
export const cleaningNext: Partial<Record<RoomStatus, RoomStatus>> = {
  DIRTY: "CLEANING",
  CLEANING: "CLEAN",
  CLEAN: "INSPECTED",
  INSPECTED: "AVAILABLE",
};
export function statusOptions(status: RoomStatus, role: Role): RoomStatus[] {
  if (status === "OCCUPIED" || status === "RESERVED") return [];
  if (role === "HOUSEKEEPING")
    return cleaningNext[status] ? [cleaningNext[status]!] : [];
  return roomManageRoles.includes(role)
    ? roomStatuses.filter(
        (s) => s !== status && s !== "OCCUPIED" && s !== "RESERVED",
      )
    : [];
}
export const statusColors: Record<RoomStatus, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-900",
  OCCUPIED: "bg-blue-100 text-blue-900",
  RESERVED: "bg-violet-100 text-violet-900",
  DIRTY: "bg-amber-100 text-amber-900",
  CLEANING: "bg-cyan-100 text-cyan-900",
  CLEAN: "bg-teal-100 text-teal-900",
  INSPECTED: "bg-green-100 text-green-900",
  OUT_OF_ORDER: "bg-red-100 text-red-900",
  MAINTENANCE: "bg-orange-100 text-orange-900",
};
export function statusLabel(status: RoomStatus) {
  return status.replaceAll("_", " ");
}
