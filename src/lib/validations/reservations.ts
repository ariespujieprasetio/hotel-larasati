import { z } from "zod";
import { nightsBetween, reservationSources } from "@/lib/reservations";
const fields = {
  id: z.uuid().optional(),
  version: z.number().int().positive().optional(),
  room_type_id: z.uuid("Select a room type."),
  check_in_date: z.iso.date(),
  check_out_date: z.iso.date(),
  adults: z.number().int().min(1).max(30),
  children: z.number().int().min(0).max(29),
  discount_amount: z.number().min(0).max(999999999999.99).multipleOf(0.01),
};
function validDates(value: { check_in_date: string; check_out_date: string }) {
  const nights = nightsBetween(value.check_in_date, value.check_out_date);
  return nights >= 1 && nights <= 365;
}
export const previewSchema = z.object(fields).refine(validDates, {
  path: ["check_out_date"],
  message: "Select a stay between 1 and 365 nights.",
});
export const reservationSchema = z
  .object({
    ...fields,
    guest_id: z.uuid("Select a guest."),
    room_id: z.union([z.literal(""), z.uuid()]),
    source: z.enum(reservationSources),
    status: z.enum(["PENDING", "CONFIRMED"]),
    special_request: z.string().trim().max(2000),
    notes: z.string().trim().max(2000),
    expected_currency: z.string().regex(/^[A-Z]{3}$/),
    expected_total: z.number().min(0).max(999999999999.99),
  })
  .refine(validDates, {
    path: ["check_out_date"],
    message: "Checkout must follow check-in, up to 365 nights.",
  })
  .refine((v) => !v.id || v.version !== undefined, {
    path: ["version"],
    message: "Reload this reservation before editing.",
  });
export type ReservationInput = z.infer<typeof reservationSchema>;
export const reservationStatusSchema = z
  .object({
    id: z.uuid(),
    version: z.number().int().positive(),
    status: z.enum(["CONFIRMED", "CANCELLED", "NO_SHOW"]),
    reason: z.string().trim().max(500),
  })
  .refine((v) => v.status === "CONFIRMED" || v.reason.length >= 3, {
    path: ["reason"],
    message: "Enter a reason (at least 3 characters).",
  });
