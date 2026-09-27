import { z } from "zod";
import { paymentMethods } from "@/lib/billing";
export const paymentSchema = z
  .object({
    folioId: z.uuid(),
    requestId: z.uuid(),
    amount: z
      .string()
      .trim()
      .regex(
        /^\d{1,12}(\.\d{1,2})?$/,
        "Enter a positive amount with at most two decimals.",
      )
      .transform(Number)
      .refine(
        (n) => n > 0 && n <= 999999999999.99,
        "Enter a positive payment amount.",
      ),
    method: z.enum(paymentMethods),
    reference: z.string().trim().max(150),
  })
  .refine((v) => v.method === "CASH" || v.reference.length >= 3, {
    message: "Enter the bank, card or QRIS transaction reference.",
    path: ["reference"],
  });
export const reversalSchema = z.object({
  paymentId: z.uuid(),
  reason: z
    .string()
    .trim()
    .min(3, "Enter a reason with at least 3 characters.")
    .max(500),
});
export const checkoutSchema = z.object({
  folioId: z.uuid(),
  version: z.number().int().positive(),
});

export const extraSchema = z
  .object({
    folioId: z.uuid(),
    requestId: z.uuid(),
    version: z.number().int().positive(),
    description: z.string().trim().min(2).max(200),
    quantity: z.number().int().min(1).max(1000),
    unitPrice: z
      .string()
      .trim()
      .regex(
        /^\d{1,12}(\.\d{1,2})?$/,
        "Enter a positive price with at most two decimals.",
      )
      .transform(Number)
      .refine((n) => n > 0 && n <= 999999999999.99),
  })
  .refine(
    (v) => v.quantity * v.unitPrice <= 999999999999.99,
    "Charge is too large.",
  );
export const voidExtraSchema = z.object({
  extraId: z.uuid(),
  version: z.number().int().positive(),
  reason: z.string().trim().min(3).max(500),
});
