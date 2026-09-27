import "server-only";
import { requireStaff } from "@/lib/services/auth";
export async function getDashboardSummary() {
  const { supabase } = await requireStaff();
  const { data, error } = await supabase.rpc("dashboard_summary");
  if (error || !data)
    throw new Error(
      "Dashboard could not be loaded. Check that the dashboard migration has been applied, then retry.",
    );
  return data;
}
