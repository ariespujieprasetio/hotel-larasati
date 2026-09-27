import { z } from "zod";
const percentage = z
  .string()
  .trim()
  .regex(/^\d{1,3}(\.\d{1,2})?$/, "Use a percentage with at most two decimals.")
  .transform(Number)
  .refine((n) => n >= 0 && n <= 100, "Percentage must be between 0 and 100.");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm time.");
export const hotelSettingsSchema = z.object({
  version: z.number().int().positive(),
  hotel_name: z.string().trim().min(1).max(150),
  address: z.string().trim().max(1000),
  phone: z.string().trim().max(40),
  email: z.union([z.literal(""), z.email().max(254)]),
  check_in_time: time,
  check_out_time: time,
  default_currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/),
  tax_percentage: percentage,
  service_charge_percentage: percentage,
  reservation_prefix: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{1,12}$/),
});
