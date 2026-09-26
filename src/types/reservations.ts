import type { RoomStatus } from "@/lib/rooms";
export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED"
  | "NO_SHOW";
export type Reservation = {
  id: string;
  reservation_number: string;
  guest_id: string;
  room_type_id: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  source: string;
  status: ReservationStatus;
  special_request: string;
  notes: string;
  cancellation_reason: string;
  nightly_rate: number;
  room_subtotal: number;
  discount_amount: number;
  service_percentage: number;
  tax_percentage: number;
  service_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  created_by: string;
  version: number;
  created_at: string;
  updated_at: string;
};
export type ReservationPreview = Pick<
  Reservation,
  | "nightly_rate"
  | "room_subtotal"
  | "discount_amount"
  | "service_percentage"
  | "tax_percentage"
  | "service_amount"
  | "tax_amount"
  | "total_amount"
  | "currency"
> & {
  nights: number;
  rooms: { id: string; room_number: string; status: RoomStatus }[];
};
export type ReservationActivity = {
  id: string;
  reservation_id: string;
  user_id: string | null;
  action: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown>;
  created_at: string;
};
export type GuestOption = {
  id: string;
  full_name: string;
  guest_code: string;
  phone: string;
};
