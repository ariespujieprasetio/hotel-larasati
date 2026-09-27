import { z } from "zod";
import { staffRoles } from "@/lib/staff";
const fields = {
  full_name: z.string().trim().min(1, "Enter the staff name.").max(150),
  phone: z.string().trim().max(40),
  role: z.enum(staffRoles),
  is_active: z.boolean(),
};
export const staffUpdateSchema = z.object({
  ...fields,
  id: z.uuid(),
  version: z.number().int().positive(),
});
export const staffCreateSchema = z.object({
  ...fields,
  email: z.email().trim().toLowerCase().max(254),
  password: z
    .string()
    .min(12, "Use at least 12 characters.")
    .refine(
      (v) => new TextEncoder().encode(v).length <= 72,
      "Use at most 72 UTF-8 bytes for the password.",
    ),
  verified: z.literal(true, {
    error: "Confirm you have verified the staff email.",
  }),
});
