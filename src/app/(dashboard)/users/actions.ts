"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireRole } from "@/lib/services/auth";
import { staffCreateSchema, staffUpdateSchema } from "@/lib/validations/staff";
import {
  createStaffAdminClient,
  hasStaffAdminConfig,
} from "@/lib/supabase/admin";
type Result = { id: string; incomplete?: boolean } | { error: string };
function refreshStaff() {
  revalidatePath("/users", "layout");
  revalidatePath("/housekeeping", "layout");
  revalidatePath("/dashboard");
}
function staffError(message: string) {
  const messages: Record<string, string> = {
    LAST_ACTIVE_OWNER:
      "Keep at least one active OWNER. Activate another owner before changing this account.",
    STALE_STAFF: "This account changed. Reload before saving.",
    NOT_AUTHORIZED: "Only an active OWNER can manage staff.",
    STAFF_NOT_FOUND: "This staff account is no longer available.",
  };
  return (
    messages[message] ??
    "Staff changes could not be saved. Reload and try again."
  );
}
export async function updateStaff(input: unknown): Promise<Result> {
  try {
    const { supabase } = await requireRole(["OWNER"]);
    const parsed = staffUpdateSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const v = parsed.data;
    const { data, error } = await supabase.rpc("update_staff_profile", {
      p_id: v.id,
      p_version: v.version,
      p_full_name: v.full_name,
      p_phone: v.phone,
      p_role: v.role,
      p_active: v.is_active,
    });
    if (error) return { error: staffError(error.message) };
    refreshStaff();
    return { id: data };
  } catch (e) {
    unstable_rethrow(e);
    return { error: "Unable to update staff. Please try again." };
  }
}
export async function createStaff(input: unknown): Promise<Result> {
  let createdId: string | undefined;
  try {
    const { supabase, profile } = await requireRole(["OWNER"]);
    const parsed = staffCreateSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    if (!hasStaffAdminConfig())
      return {
        error:
          "Account creation is not configured on the server. See the Users setup instructions.",
      };
    // Check the migration and current role before invoking the privileged Auth API.
    const preflight = await supabase
      .from("profiles")
      .select("version")
      .eq("id", profile.id)
      .single();
    if (preflight.error)
      return {
        error: "Apply the staff management migration before creating accounts.",
      };
    const authorization = await supabase.rpc("current_staff_role");
    if (authorization.error || authorization.data !== "OWNER")
      return { error: "Only an active OWNER can create staff." };
    const v = parsed.data;
    const { data, error } =
      await createStaffAdminClient().auth.admin.createUser({
        email: v.email,
        password: v.password,
        email_confirm: true,
        user_metadata: { full_name: v.full_name },
      });
    if (error || !data.user)
      return {
        error:
          error?.code === "email_exists"
            ? "An account already uses this email. Find it in Users or Supabase Authentication."
            : error?.code === "weak_password"
              ? "The password does not meet the Supabase password policy."
              : "Account creation failed. Check the email, password policy and server configuration. If a previous attempt was interrupted, check Users before retrying.",
      };
    createdId = data.user.id;
    // Auth's trigger creates an inactive FRONT_OFFICE profile. Configuration uses
    // the owner's session, not the admin client, so DB authorization still applies.
    const target = await supabase
      .from("profiles")
      .select("version")
      .eq("id", createdId)
      .single();
    if (target.error) {
      refreshStaff();
      return { id: createdId, incomplete: true };
    }
    const configured = await supabase.rpc("update_staff_profile", {
      p_id: createdId,
      p_version: target.data.version,
      p_full_name: v.full_name,
      p_phone: v.phone,
      p_role: v.role,
      p_active: v.is_active,
    });
    refreshStaff();
    return { id: createdId, incomplete: Boolean(configured.error) };
  } catch (e) {
    unstable_rethrow(e);
    if (createdId) return { id: createdId, incomplete: true };
    return {
      error: "Unable to confirm account creation. Check Users before retrying.",
    };
  }
}
