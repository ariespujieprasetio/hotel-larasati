export type MaintenanceTask = {
  id: string;
  room_id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  created_by: string;
  version: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
};
export type MaintenanceActivity = {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  note: string;
  created_at: string;
};
