import { z } from "zod";
export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").max(254).trim(),
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(256, "Password is too long."),
});
export type LoginInput = z.infer<typeof loginSchema>;
