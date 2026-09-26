import { z } from "zod";
import { identityTypes, jakartaDate } from "@/lib/guests";
const optionalDate = z
  .union([z.literal(""), z.iso.date()])
  .refine(
    (v) => !v || (v >= "1900-01-01" && v <= jakartaDate()),
    "Use a valid birth date between 1900 and today.",
  );
export const guestSchema = z
  .object({
    id: z.uuid().optional(),
    version: z.number().int().positive().optional(),
    full_name: z
      .string()
      .trim()
      .min(2, "Enter the guest's full name.")
      .max(150),
    id_type: z.enum(identityTypes),
    id_number: z
      .string()
      .trim()
      .max(80)
      .regex(/^[A-Za-z0-9 -]*$/, "Use letters, numbers, spaces or hyphens."),
    nationality: z.string().trim().max(80),
    gender: z.enum(["", "MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]),
    date_of_birth: optionalDate,
    phone: z
      .string()
      .trim()
      .max(40)
      .refine(
        (v) =>
          !v || (/^[+0-9 ().-]+$/.test(v) && v.replace(/\D/g, "").length >= 6),
        "Enter a valid phone number.",
      ),
    email: z.union([z.literal(""), z.email().max(254)]),
    address: z.string().trim().max(1000),
    company_name: z.string().trim().max(150),
    notes: z.string().trim().max(2000),
    is_active: z.boolean(),
  })
  .refine((v) => !v.id || v.version !== undefined, {
    path: ["version"],
    message: "Reload the guest before editing.",
  })
  .refine(
    (v) => v.id_type !== "KTP" || !v.id_number || /^\d{16}$/.test(v.id_number),
    { path: ["id_number"], message: "KTP must contain exactly 16 digits." },
  );
export type GuestInput = z.infer<typeof guestSchema>;
export function parseGuestSearch(
  params: Record<string, string | string[] | undefined>,
) {
  const text = (key: string) =>
    typeof params[key] === "string" ? (params[key] as string) : "";
  const field = z
    .enum(["full_name", "phone", "id_number", "guest_code"])
    .catch("full_name")
    .parse(text("field"));
  const sort = z
    .enum(["full_name", "created_at", "guest_code"])
    .catch("full_name")
    .parse(text("sort"));
  const n = Number(text("page"));
  return {
    q: text("q").trim().slice(0, 150),
    field,
    sort,
    active:
      text("active") === "all"
        ? "all"
        : text("active") === "inactive"
          ? "inactive"
          : "active",
    page: Number.isInteger(n) && n > 0 ? Math.min(n, 10000) : 1,
  };
}
