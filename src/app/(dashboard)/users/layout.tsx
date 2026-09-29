// localized-ui
import { T } from "@/components/i18n/language-provider";
import { requireStaff } from "@/lib/services/auth";
import { staffReadRoles } from "@/lib/staff";
export default async function ReservationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireStaff();
  if (!staffReadRoles.includes(profile.role))
    return (
      <section role="alert" className="rounded-xl border bg-card p-6">
        <h1 className="text-xl font-semibold">
          <T>{"Access restricted"}</T>
        </h1>
        <p className="mt-2">
          <T>{"Your role cannot access staff management."}</T>
        </p>
      </section>
    );
  return children;
}
