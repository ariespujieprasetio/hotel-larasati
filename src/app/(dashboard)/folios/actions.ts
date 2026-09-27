"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireRole } from "@/lib/services/auth";
import { billingRoles } from "@/lib/billing";
import { reservationRoles } from "@/lib/reservations";
import {
  extraSchema,
  voidExtraSchema,
  paymentSchema,
  reversalSchema,
  checkoutSchema,
} from "@/lib/validations/billing";
type Result = { ok: true } | { error: string };
function message(error: { message: string; code?: string }) {
  const messages: Record<string, string> = {
    INVALID_EXTRA: "Enter a valid description, quantity and final unit price.",
    EXTRA_REQUEST_CONFLICT:
      "This request was used for different charge details. Review the history before retrying.",
    EXTRA_ALREADY_PAID:
      "This cancellation would make payments exceed the bill. Review the recorded payments first; refunds are not supported here.",
    AMOUNT_TOO_LARGE: "This charge would exceed the maximum bill amount.",
    INVALID_PAYMENT:
      "Enter a valid payment amount, method and transaction reference.",
    PAYMENT_EXCEEDS_BALANCE:
      "The payment exceeds the current balance. Reload and review the bill.",
    PAYMENT_REQUEST_CONFLICT:
      "This payment request was already used for different details. Reload before retrying.",
    FOLIO_CLOSED: "This bill is closed and cannot be changed.",
    STALE_FOLIO: "The bill changed. Reload and review it before continuing.",
    BALANCE_DUE: "Record the remaining payment before check-out.",
    NOT_CHECKED_IN: "This reservation is not currently checked in.",
    STAY_ROOM_MISMATCH:
      "The room and stay records do not match. Check-out was not completed.",
    REASON_REQUIRED: "Enter a reason with at least three characters.",
  };
  return (
    messages[error.message] ??
    "The request could not be completed. Reload and try again."
  );
}
function refreshBilling() {
  for (const path of [
    "/folios",
    "/payments",
    "/check-out",
    "/in-house",
    "/housekeeping",
    "/rooms",
    "/reservations",
    "/guests",
  ])
    revalidatePath(path, "layout");
  revalidatePath("/dashboard");
}
export async function recordPayment(input: unknown): Promise<Result> {
  try {
    const { supabase } = await requireRole(billingRoles);
    const parsed = paymentSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const v = parsed.data;
    const { error } = await supabase.rpc("record_payment", {
      p_folio: v.folioId,
      p_request: v.requestId,
      p_amount: v.amount,
      p_method: v.method,
      p_reference: v.reference,
    });
    if (error) return { error: message(error) };
    refreshBilling();
    return { ok: true };
  } catch (e) {
    unstable_rethrow(e);
    return {
      error:
        "Unable to record payment. Retry with the same details to avoid duplicate recording.",
    };
  }
}
export async function reversePayment(input: unknown): Promise<Result> {
  try {
    const { supabase } = await requireRole(["OWNER", "MANAGER"]);
    const parsed = reversalSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const { error } = await supabase.rpc("reverse_payment", {
      p_payment: parsed.data.paymentId,
      p_reason: parsed.data.reason,
    });
    if (error) return { error: message(error) };
    refreshBilling();
    return { ok: true };
  } catch (e) {
    unstable_rethrow(e);
    return { error: "Unable to reverse payment. Please try again." };
  }
}
export async function checkOut(input: unknown): Promise<Result> {
  try {
    const { supabase } = await requireRole(reservationRoles);
    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success)
      return { error: "Reload the bill before checking out." };
    const { error } = await supabase.rpc("check_out_reservation", {
      p_folio: parsed.data.folioId,
      p_version: parsed.data.version,
    });
    if (error) return { error: message(error) };
    refreshBilling();
    return { ok: true };
  } catch (e) {
    unstable_rethrow(e);
    return { error: "Unable to check out. Reload and try again." };
  }
}

export async function addExtra(input: unknown): Promise<Result> {
  try {
    const { supabase } = await requireRole(billingRoles);
    const parsed = extraSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const v = parsed.data;
    const { error } = await supabase.rpc("add_folio_extra", {
      p_folio: v.folioId,
      p_request: v.requestId,
      p_version: v.version,
      p_description: v.description,
      p_quantity: v.quantity,
      p_unit_price: v.unitPrice,
    });
    if (error) return { error: message(error) };
    refreshBilling();
    return { ok: true };
  } catch (e) {
    unstable_rethrow(e);
    return {
      error:
        "Unable to confirm the charge. Retry the same details, or check charge history before creating another.",
    };
  }
}
export async function voidExtra(input: unknown): Promise<Result> {
  try {
    const { supabase } = await requireRole(["OWNER", "MANAGER"]);
    const parsed = voidExtraSchema.safeParse(input);
    if (!parsed.success)
      return { error: "Enter a cancellation reason (3-500 characters)." };
    const v = parsed.data;
    const { error } = await supabase.rpc("void_folio_extra", {
      p_id: v.extraId,
      p_version: v.version,
      p_reason: v.reason,
    });
    if (error) return { error: message(error) };
    refreshBilling();
    return { ok: true };
  } catch (e) {
    unstable_rethrow(e);
    return {
      error: "Unable to cancel this charge. Reload and review its status.",
    };
  }
}
