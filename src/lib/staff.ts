import type { Role } from "@/types/database";
export const staffRoles = [
  "OWNER",
  "MANAGER",
  "FRONT_OFFICE",
  "HOUSEKEEPING",
  "FINANCE",
] as const;
export const staffReadRoles: readonly Role[] = ["OWNER", "MANAGER"];
