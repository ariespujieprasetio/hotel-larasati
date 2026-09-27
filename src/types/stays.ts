export type Stay = {
  id: string;
  reservation_id: string;
  room_id: string;
  checked_in_at: string;
  checked_in_by: string;
  checked_out_at: string | null;
};
