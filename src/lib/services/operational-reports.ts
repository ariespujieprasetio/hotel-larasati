import "server-only";
import { requireRole } from "@/lib/services/auth";
import { operationalDates, type ReportKind } from "@/lib/operational-reports";
export async function getOperationalReport(
  kind: ReportKind,
  from: string,
  to: string,
) {
  const dates = operationalDates.parse({ from, to });
  const { supabase } = await requireRole(["OWNER", "MANAGER", "FINANCE"]);
  const { data, error } = await supabase.rpc("operational_report", {
    p_kind: kind,
    p_from: dates.from,
    p_to: dates.to,
  });
  if (error || !data)
    throw new Error(
      "Report unavailable. Apply the operational reports migration.",
    );
  return data;
}
