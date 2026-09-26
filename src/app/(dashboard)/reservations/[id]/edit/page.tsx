import Link from "next/link";
import { requireRole } from "@/lib/services/auth";
import { reservationRoles } from "@/lib/reservations";
import { getRoomTypes } from "@/lib/services/rooms";
import { getReservationContext } from "@/lib/services/reservations";
import { ReservationForm } from "@/components/reservations/reservation-form";
export const metadata = { title: "Edit reservation" };
export default async function EditReservation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await requireRole(reservationRoles);
  const [{ reservation, guest }, types] = await Promise.all([
    getReservationContext(id),
    getRoomTypes(),
  ]);
  if (!["PENDING", "CONFIRMED"].includes(reservation.status))
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">
          This booking can no longer be edited
        </h1>
        <Link className="underline" href={"/reservations/" + id}>
          Back to reservation
        </Link>
      </div>
    );
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">
        Edit {reservation.reservation_number}
      </h1>
      <p className="text-sm text-muted-foreground">
        Changing dates, room type or discount recalculates current rates. Other
        edits retain the saved price.
      </p>
      <ReservationForm
        key={reservation.version}
        types={types}
        role={profile.role}
        reservation={reservation}
        initialGuest={guest}
      />
    </div>
  );
}
