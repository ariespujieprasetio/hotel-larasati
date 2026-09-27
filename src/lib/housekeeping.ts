import type { Role } from "@/types/database";
export const housekeepingReadRoles: readonly Role[] = [
  "OWNER",
  "MANAGER",
  "HOUSEKEEPING",
  "FRONT_OFFICE",
];
export const housekeepingWriteRoles: readonly Role[] = [
  "OWNER",
  "MANAGER",
  "HOUSEKEEPING",
];
export const housekeepingStatuses = [
  "DIRTY",
  "CLEANING",
  "CLEAN",
  "INSPECTED",
  "COMPLETED",
  "CANCELLED",
] as const;
export type HousekeepingStatus = (typeof housekeepingStatuses)[number];
export const housekeepingNext: Partial<Record<HousekeepingStatus, string>> = {
  DIRTY: "Start cleaning",
  CLEANING: "Mark clean",
  CLEAN: "Mark inspected",
  INSPECTED: "Make available",
};
