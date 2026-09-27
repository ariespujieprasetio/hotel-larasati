import type {
  Reservation,
  ReservationPreview,
  ReservationActivity,
} from "@/types/reservations";
import type { Folio, Payment } from "@/types/billing";
import type {
  HousekeepingTask,
  HousekeepingActivity,
} from "@/types/housekeeping";
import type { StaffActivity } from "@/types/staff";
import type { Stay } from "@/types/stays";
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
import type { Guest, GuestActivity } from "@/types/guests";
import type { Room, RoomType, RoomActivity } from "@/types/rooms";
import type { RoomStatus } from "@/lib/rooms";
export type Role =
  "OWNER" | "MANAGER" | "FRONT_OFFICE" | "HOUSEKEEPING" | "FINANCE";
export type Profile = {
  version: number;
  id: string;
  full_name: string;
  email: string;
  role: Role;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
export type HotelSettings = {
  id: string;
  hotel_name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  check_in_time: string;
  check_out_time: string;
  default_currency: string;
  tax_percentage: number;
  service_charge_percentage: number;
  invoice_prefix: string;
  reservation_prefix: string;
  created_at: string;
  updated_at: string;
};
type Table<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};
export type Database = {
  public: {
    Tables: {
      staff_activity: Table<StaffActivity, never>;
      housekeeping_tasks: Table<HousekeepingTask, never>;
      housekeeping_activity: Table<HousekeepingActivity, never>;
      folios: Table<Folio, never>;
      payments: Table<Payment, never>;
      stays: Table<Stay, never>;
      reservations: Table<Reservation, never>;
      reservation_activity: Table<ReservationActivity, never>;
      guests: Table<
        Guest,
        Pick<Guest, "full_name"> & Partial<Omit<Guest, "full_name">>
      >;
      guest_activity: Table<GuestActivity, never>;
      profiles: Table<
        Profile,
        Pick<Profile, "id" | "full_name" | "email"> &
          Partial<Omit<Profile, "id" | "full_name" | "email">>
      >;
      rooms: Table<
        Room,
        Pick<Room, "room_number" | "room_type_id"> &
          Partial<Omit<Room, "room_number" | "room_type_id">>
      >;
      room_types: Table<
        RoomType,
        Pick<RoomType, "name" | "base_price" | "capacity" | "bed_type"> &
          Partial<
            Omit<RoomType, "name" | "base_price" | "capacity" | "bed_type">
          >
      >;
      room_activity: Table<RoomActivity, never>;
      hotel_settings: Table<HotelSettings, Partial<HotelSettings>>;
    };
    Views: { [_ in never]: never };
    Functions: {
      update_staff_profile: {
        Args: {
          p_id: string;
          p_version: number;
          p_full_name: string;
          p_phone: string;
          p_role: Role;
          p_active: boolean;
        };
        Returns: string;
      };

      housekeeping_staff: {
        Args: Record<string, never>;
        Returns: { id: string; full_name: string }[];
      };
      update_housekeeping_task: {
        Args: {
          p_id: string;
          p_version: number;
          p_action: string;
          p_assignee: string | null;
          p_note: string;
        };
        Returns: string;
      };

      record_payment: {
        Args: {
          p_folio: string;
          p_request: string;
          p_amount: number;
          p_method: string;
          p_reference: string;
        };
        Returns: string;
      };
      reverse_payment: {
        Args: { p_payment: string; p_reason: string };
        Returns: string;
      };
      check_out_reservation: {
        Args: { p_folio: string; p_version: number };
        Returns: string;
      };

      check_in_reservation: {
        Args: { p_id: string; p_version: number };
        Returns: string;
      };
      reservation_preview: {
        Args: { p_data: Json };
        Returns: ReservationPreview;
      };
      save_reservation: { Args: { p_data: Json }; Returns: string };
      set_reservation_status: {
        Args: {
          p_id: string;
          p_version: number;
          p_status: string;
          p_reason: string;
        };
        Returns: string;
      };
      current_staff_role: { Args: Record<string, never>; Returns: Role | null };
    };
    Enums: { staff_role: Role; room_status: RoomStatus };
    CompositeTypes: { [_ in never]: never };
  };
};
