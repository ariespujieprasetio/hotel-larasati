import { requireStaff } from "@/lib/services/auth";
import { guestRoles } from "@/lib/guests";
export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireStaff();
  if (!guestRoles.includes(profile.role))
    return (
      <section role="alert" className="rounded-xl border bg-card p-6">
        <h1 className="text-xl font-semibold">Access restricted</h1>
        <p className="mt-2">Your role does not have access to guest records.</p>
      </section>
    );
  return children;
}
