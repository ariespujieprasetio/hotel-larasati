import type { ReservationPreview } from "@/types/reservations";
import type { paymentMethods } from "@/lib/billing";
export type Folio = {
  id: string;
  reservation_id: string;
  folio_number: string;
  reservation_number: string;
  guest_name: string;
  room_number: string;
  currency: string;
  charges: Omit<ReservationPreview, "rooms" | "currency" | "total_amount">;
  total_amount: number;
  paid_amount: number;
  balance: number;
  version: number;
  created_at: string;
  closed_at: string | null;
};
export type Payment = {
  id: string;
  folio_id: string;
  kind: "PAYMENT" | "REVERSAL";
  amount: number;
  method: (typeof paymentMethods)[number];
  reference: string;
  reversal_of: string | null;
  reason: string;
  created_by: string;
  created_at: string;
};

export type FolioExtra = {
  id: string;
  folio_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_by: string;
  created_at: string;
  voided_at: string | null;
  voided_by: string | null;
  void_reason: string;
};
