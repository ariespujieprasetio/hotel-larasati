"use server";
import { z } from "zod";
import { unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/services/auth";
import { expenseSchema } from "@/lib/expenses";
function refresh() {
  revalidatePath("/expenses");
  revalidatePath("/reports", "layout");
}
export async function recordExpense(
  input: unknown,
): Promise<{ ok: true } | { error: string }> {
  try {
    const { supabase } = await requireRole(["OWNER", "MANAGER", "FINANCE"]);
    const p = expenseSchema.safeParse(input);
    if (!p.success) return { error: p.error.issues[0].message };
    const v = p.data;
    const { error } = await supabase.rpc("record_expense", {
      p_id: v.id,
      p_date: v.paid_on,
      p_category: v.category,
      p_amount: v.amount,
      p_currency: v.currency,
      p_method: v.method,
      p_description: v.description,
      p_reference: v.reference,
    });
    if (error)
      return {
        error:
          error.message === "REQUEST_CONFLICT"
            ? "Request already used for different details. Review history before retrying."
            : "Expense could not be recorded. Check the fields, payment date and migration.",
      };
    refresh();
    return { ok: true };
  } catch (e) {
    unstable_rethrow(e);
    return {
      error:
        "Unable to confirm save. Retry the same details or check the list before creating another expense.",
    };
  }
}
export async function voidExpense(
  input: unknown,
): Promise<{ ok: true } | { error: string }> {
  try {
    const { supabase } = await requireRole(["OWNER", "MANAGER"]);
    const p = z
      .object({ id: z.uuid(), reason: z.string().trim().min(3).max(500) })
      .safeParse(input);
    if (!p.success) return { error: "Enter a reason of 3-500 characters." };
    const { error } = await supabase.rpc("void_expense", {
      p_id: p.data.id,
      p_reason: p.data.reason,
    });
    if (error) return { error: "Cancellation failed. Reload and try again." };
    refresh();
    return { ok: true };
  } catch (e) {
    unstable_rethrow(e);
    return {
      error: "Unable to confirm cancellation. Reload to review its status.",
    };
  }
}
