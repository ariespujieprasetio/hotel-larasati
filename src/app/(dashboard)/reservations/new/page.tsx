import { requireRole } from "@/lib/services/auth";
import { reservationRoles } from "@/lib/reservations";
import { getRoomTypes } from "@/lib/services/rooms";
import { getGuest } from "@/lib/services/guests";
import { ReservationForm } from "@/components/reservations/reservation-form";
export const metadata = { title: "New reservation" };
export default async function NewReservation({
  searchParams,
}: {
  searchParams: Promise<{ guest?: string }>;
}) {
  const { profile } = await requireRole(reservationRoles);
  const types = await getRoomTypes();
  const params = await searchParams;
  const guest =
    typeof params.guest === "string" ? await getGuest(params.guest) : undefined;
  const initialGuest = guest?.is_active
    ? {
        id: guest.id,
        full_name: guest.full_name,
        guest_code: guest.guest_code,
        phone: guest.phone,
      }
    : undefined;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">New reservation</h1>
      <ReservationForm
        types={types}
        role={profile.role}
        initialGuest={initialGuest}
      />
    </div>
  );
}
