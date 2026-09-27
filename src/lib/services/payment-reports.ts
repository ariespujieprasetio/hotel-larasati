import "server-only";
import { requireRole } from "@/lib/services/auth";
import { reportDates } from "@/lib/payment-reports";
export async function getPaymentReport(from: string, to: string) {
  const dates = reportDates.parse({ from, to });
  const { supabase } = await requireRole(["OWNER", "MANAGER", "FINANCE"]);
  const { data, error } = await supabase.rpc("payment_report", {
    p_from: dates.from,
    p_to: dates.to,
  });
  if (error || !data)
    throw new Error(
      "Payment report unavailable. Check the report migration and connection.",
    );
  return data;
}
