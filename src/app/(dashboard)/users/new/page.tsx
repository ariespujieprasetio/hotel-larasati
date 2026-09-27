import Link from "next/link";
import { requireRole } from "@/lib/services/auth";
import { hasStaffAdminConfig } from "@/lib/supabase/admin";
import { StaffForm } from "@/components/users/staff-form";
export const metadata = { title: "Add staff" };
export default async function NewStaffPage() {
  const { profile } = await requireRole(["OWNER"]);
  return (
    <div className="space-y-6">
      <Link href="/users" className="text-sm underline">
        Back to staff
      </Link>
      <h1 className="text-3xl font-semibold">Add staff account</h1>
      {hasStaffAdminConfig() ? (
        <StaffForm currentUserId={profile.id} />
      ) : (
        <section
          role="alert"
          className="space-y-3 rounded-xl border bg-card p-6"
        >
          <h2 className="text-xl font-semibold">
            Account creation needs server setup
          </h2>
          <p>
            Add <code>SUPABASE_SECRET_KEY</code> to the server environment and
            restart the app. Follow the Staff management section in README.
          </p>
          <p>
            You can still edit roles and activate accounts already created in
            Supabase Authentication from the Users list.
          </p>
        </section>
      )}
    </div>
  );
}
