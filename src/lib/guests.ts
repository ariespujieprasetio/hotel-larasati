import type { Role } from "@/types/database";
export const guestRoles: readonly Role[] = ["OWNER", "MANAGER", "FRONT_OFFICE"];
export const identityTypes = ["KTP", "PASSPORT", "SIM", "OTHER"] as const;
export function jakartaDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function maskIdentity(value: string) {
  return value ? "•••• " + value.slice(-4) : "Not recorded";
}
