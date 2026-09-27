import { requireStaff } from "@/lib/services/auth";
import { reservationRoles } from "@/lib/reservations";
export default async function ReservationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireStaff();
  if (!reservationRoles.includes(profile.role))
    return (
      <section role="alert" className="rounded-xl border bg-card p-6">
        <h1 className="text-xl font-semibold">Access restricted</h1>
        <p className="mt-2">Your role cannot access this module.</p>
      </section>
    );
  return children;
}
