import type { Role } from "@/types/database";
export const billingRoles: readonly Role[] = [
  "OWNER",
  "MANAGER",
  "FRONT_OFFICE",
  "FINANCE",
];
export const paymentMethods = [
  "CASH",
  "BANK_TRANSFER",
  "CARD",
  "QRIS",
] as const;
export function billingDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
export function billingPage(value: unknown) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? Math.min(n, 10000) : 1;
}
