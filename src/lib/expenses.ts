import { z } from "zod";
export const expenseCategories = [
  "UTILITIES",
  "LAUNDRY",
  "SUPPLIES",
  "PAYROLL",
  "REPAIRS",
  "OTHER",
] as const;
export const expenseSchema = z
  .object({
    id: z.uuid(),
    paid_on: z.iso.date(),
    category: z.enum(expenseCategories),
    amount: z
      .string()
      .regex(/^\d{1,12}(\.\d{1,2})?$/)
      .transform(Number)
      .refine((v) => v > 0 && v <= 999999999999.99),
    currency: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{3}$/),
    method: z.enum(["CASH", "BANK_TRANSFER", "CARD", "QRIS"]),
    description: z.string().trim().min(3).max(1000),
    reference: z.string().trim().max(150),
  })
  .refine(
    (v) => v.method === "CASH" || v.reference.length >= 3,
    "Non-cash expenses require a reference.",
  );
export type Expense = {
  id: string;
  paid_on: string;
  category: string;
  amount: number;
  currency: string;
  method: string;
  description: string;
  reference: string;
  created_by: string;
  created_at: string;
  voided_by: string | null;
  voided_at: string | null;
  void_reason: string;
};
export type ExpenseSummary = {
  currency: string;
  category: string;
  entries: number;
  amount: string;
}[];
