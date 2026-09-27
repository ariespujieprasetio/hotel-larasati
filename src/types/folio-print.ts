import type { Folio, FolioExtra, Payment } from "@/types/billing";
export type FolioPrint = {
  folio: Omit<Folio, "id" | "reservation_id">;
  hotel: {
    hotel_name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
  };
  arrival: string;
  departure: string;
  generated_at: string;
  extras: Pick<
    FolioExtra,
    "id" | "description" | "quantity" | "unit_price" | "amount"
  >[];
  payments: Pick<Payment, "id" | "kind" | "amount" | "method" | "created_at">[];
};
