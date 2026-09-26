import Link from "next/link";
import { guestReservationHistory } from "@/lib/services/reservations";
import { money } from "@/lib/reservations";
import { getGuest, getGuestActivity } from "@/lib/services/guests";
import { Button } from "@/components/ui/button";
export const metadata = { title: "Guest details" };
export default async function GuestDetails({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const guest = await getGuest(id);
  const bookingHistory = await guestReservationHistory(id);
  const [activity, query] = await Promise.all([
    getGuestActivity(id),
    searchParams,
  ]);
  return (
    <div className="space-y-6">
      <Link className="text-sm underline" href="/guests">
        Back to guests
      </Link>
      {query.saved === "1" && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 p-4 text-emerald-900"
        >
          Guest saved successfully.
        </p>
      )}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{guest.full_name}</h1>
          <p className="mt-2 text-muted-foreground">
            {guest.guest_code} · {guest.is_active ? "Active" : "Inactive"}
          </p>
        </div>
        <div className="flex gap-3">
          {guest.is_active && (
            <Button asChild>
              <Link href={"/reservations/new?guest=" + guest.id}>
                New reservation
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href={"/guests/" + id + "/edit"}>Edit guest</Link>
          </Button>
        </div>
      </header>
      <section className="rounded-xl border bg-card p-6">
        <h2 className="mb-5 text-xl font-semibold">Personal information</h2>
        <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[
            ["Identity type", guest.id_type],
            ["Identity number", guest.id_number],
            ["Nationality", guest.nationality],
            ["Gender", guest.gender.replaceAll("_", " ")],
            ["Date of birth", guest.date_of_birth],
            ["Phone", guest.phone],
            ["Email", guest.email],
            ["Company", guest.company_name],
            ["Address", guest.address],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="mt-1 break-words whitespace-pre-wrap">
                {value || "Not recorded"}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">Notes</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm">
          {guest.notes || "No guest notes."}
        </p>
      </section>
      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">Bookings, stays & payments</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          History will become available when the reservation and billing modules
          are connected.
        </p>
      </section>
      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">Recent reservations</h2>
        {bookingHistory.unavailable ? (
          <p className="mt-3 text-sm">
            Booking history is unavailable. Check the reservation migration and
            connection.
          </p>
        ) : bookingHistory.data.length ? (
          <ul className="my-4 divide-y">
            {bookingHistory.data.map((booking) => (
              <li key={booking.id} className="py-3 text-sm">
                <Link
                  className="font-medium underline"
                  href={"/reservations/" + booking.id}
                >
                  {booking.reservation_number}
                </Link>
                <p>
                  {booking.check_in_date} → {booking.check_out_date} ·{" "}
                  {booking.status} ·{" "}
                  {money(booking.total_amount, booking.currency)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="my-3 text-sm">No reservations yet.</p>
        )}
        <h2 className="mt-6 text-xl font-semibold">Recent record changes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Latest 20 changes · WIB
        </p>
        <ul className="mt-4 divide-y">
          {activity.map((event) => (
            <li key={event.id} className="space-y-1 py-3 text-sm">
              <p className="font-medium">{event.action}</p>
              <p>
                {event.changed_fields
                  .map((field) => field.replaceAll("_", " "))
                  .join(", ") || "No field changes"}
              </p>
              <p className="text-muted-foreground">
                {new Intl.DateTimeFormat("en-GB", {
                  timeZone: "Asia/Jakarta",
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(event.created_at))}
              </p>
              <p className="break-all text-xs text-muted-foreground">
                Staff ID: {event.user_id ?? "System / deleted account"}
              </p>
            </li>
          ))}
        </ul>
        {!activity.length && (
          <p className="mt-4 text-sm">No recorded changes.</p>
        )}
      </section>
    </div>
  );
}
