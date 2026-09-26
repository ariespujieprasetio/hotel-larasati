import type { Role } from "@/types/database";
export const reservationRoles: readonly Role[] = [
  "OWNER",
  "MANAGER",
  "FRONT_OFFICE",
];
export const reservationStatuses = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CANCELLED",
  "NO_SHOW",
] as const;
export const reservationSources = [
  "WALK_IN",
  "PHONE",
  "WHATSAPP",
  "DIRECT",
  "OTA",
  "TRAVEL_AGENT",
  "OTHER",
] as const;
export function nightsBetween(arrival: string, departure: string) {
  return Math.round(
    (Date.parse(departure + "T00:00:00Z") -
      Date.parse(arrival + "T00:00:00Z")) /
      86400000,
  );
}
export function money(value: number, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency }).format(
    value,
  );
}
