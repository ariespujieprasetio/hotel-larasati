import Link from "next/link";
import { getStaff } from "@/lib/services/staff";
import { StaffForm } from "@/components/users/staff-form";
export const metadata = { title: "Staff profile" };
export default async function StaffPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; setup?: string }>;
}) {
  const { id } = await params;
  const [{ staff, profile, activity, activityCount }, query] =
    await Promise.all([getStaff(id), searchParams]);
  return (
    <div className="space-y-6">
      <Link href="/users" className="text-sm underline">
        Back to staff
      </Link>
      <h1 className="text-3xl font-semibold">{staff.full_name}</h1>
      {query.saved === "1" && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 p-4 text-emerald-900"
        >
          Staff account saved.
        </p>
      )}
      {query.setup === "pending" && (
        <p role="alert" className="rounded-lg bg-amber-50 p-4 text-amber-900">
          The Auth account was created, but profile setup could not be
          confirmed. Review the current role and active status below, then save.
          Do not create the account again.
        </p>
      )}
      {profile.role === "OWNER" ? (
        <StaffForm
          key={staff.version}
          staff={staff}
          currentUserId={profile.id}
        />
      ) : (
        <section className="space-y-3 rounded-xl border bg-card p-6">
          <p>{staff.email}</p>
          <p>{staff.phone || "No phone recorded"}</p>
          <p>
            {staff.role} &middot; {staff.is_active ? "Active" : "Inactive"}
          </p>
          <p className="text-sm text-muted-foreground">
            Managers can review staff accounts. An owner must make changes.
          </p>
        </section>
      )}
      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">Account activity</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Latest {Math.min(activityCount, 50)} of {activityCount} events
          &middot; WIB
        </p>
        {!activity.length && (
          <p className="mt-4 text-sm">
            No changes recorded since staff management was enabled.
          </p>
        )}
        <ul className="mt-4 divide-y">
          {activity.map((a) => (
            <li key={a.id} className="space-y-2 py-3 text-sm">
              <p className="font-medium">{a.action}</p>
              <p>{a.changed_fields.join(", ") || "Profile saved"}</p>
              <p>
                {new Intl.DateTimeFormat("en-GB", {
                  timeZone: "Asia/Jakarta",
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(a.created_at))}
              </p>
              <p className="break-all text-xs text-muted-foreground">
                Actor: {a.user_id ?? "Authentication / system"}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
