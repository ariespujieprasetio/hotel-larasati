import type { RoomStatus } from "@/lib/rooms";
export type RoomType = {
  id: string;
  name: string;
  description: string;
  base_price: number;
  capacity: number;
  bed_type: string;
  size: number | null;
  amenities: string[];
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
};
export type Room = {
  id: string;
  room_number: string;
  room_type_id: string;
  floor: number;
  status: RoomStatus;
  notes: string;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
};
export type RoomActivity = {
  id: string;
  user_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown>;
  created_at: string;
};
