import "server-only";
import { requireRole } from "@/lib/services/auth";
import { parseAuditSearch } from "@/lib/audit";

export async function getAuditLog(
  input: Record<string, string | string[] | undefined>,
) {
  const search = parseAuditSearch(input);
  const { supabase } = await requireRole(["OWNER", "MANAGER"]);
  const [{ data, error }, staff] = await Promise.all([
    supabase.rpc("audit_log", {
      p_from: search.from,
      p_to: search.to,
      p_module: search.module,
      p_actor: search.actor || null,
      p_offset: (search.page - 1) * 50,
      p_limit: 50,
    }),
    supabase
      .from("profiles")
      .select("id,full_name,email,is_active")
      .order("full_name")
      .order("id"),
  ]);
  if (error || !data)
    throw new Error("Audit log unavailable. Apply the audit log migration.");
  if (staff.error) throw new Error("Staff filter unavailable.");
  return { search, result: data, staff: staff.data ?? [] };
}
