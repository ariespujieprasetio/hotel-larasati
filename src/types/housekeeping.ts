import type { HousekeepingStatus } from "@/lib/housekeeping";
export type HousekeepingTask = {
  id: string;
  room_id: string;
  room_number: string;
  status: HousekeepingStatus;
  assigned_to: string | null;
  assignee_name: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
};
export type HousekeepingActivity = {
  id: string;
  task_id: string;
  user_id: string | null;
  action: string;
  status: HousekeepingStatus;
  note: string;
  assignee_name: string | null;
  created_at: string;
};
