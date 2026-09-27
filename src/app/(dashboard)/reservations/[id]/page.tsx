import Link from "next/link";
import { CheckInForm } from "@/components/reservations/check-in-form";
import { getReservationContext } from "@/lib/services/reservations";
import { nightsBetween } from "@/lib/reservations";
import { ReservationBadge } from "@/components/reservations/status-badge";
import { ReservationStatusForm } from "@/components/reservations/status-form";
import { QuoteSummary } from "@/components/reservations/summary";
import { Button } from "@/components/ui/button";
export const metadata = { title: "Reservation details" };
export default async function ReservationDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const [{ reservation: r, guest, room, roomType, activity }, query] =
    await Promise.all([getReservationContext(id), searchParams]);
  return (
    <div className="space-y-6">
      <Link className="text-sm underline" href="/reservations">
        Back to reservations
      </Link>
      {query.saved === "1" && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 p-4 text-emerald-900"
        >
          Reservation saved successfully.
        </p>
      )}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{r.reservation_number}</h1>
          <div className="mt-3">
            <ReservationBadge status={r.status} />
          </div>
        </div>
        {["PENDING", "CONFIRMED"].includes(r.status) && (
          <Button asChild>
            <Link href={"/reservations/" + id + "/edit"}>Edit booking</Link>
          </Button>
        )}
      </header>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-5 rounded-xl border bg-card p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold">Guest & stay</h2>
          <Link
            href={"/guests/" + guest.id}
            className="font-semibold underline"
          >
            {guest.full_name} · {guest.guest_code}
          </Link>
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              ["Room", room.room_number + " · " + roomType.name],
              ["Room readiness", room.status.replaceAll("_", " ")],
              ["Check-in", r.check_in_date],
              ["Check-out", r.check_out_date],
              ["Guests", r.adults + " adults, " + r.children + " children"],
              ["Source", r.source.replaceAll("_", " ")],
              ["Phone", guest.phone || "Not recorded"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="mt-1 font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <QuoteSummary
            quote={{
              ...r,
              nights: nightsBetween(r.check_in_date, r.check_out_date),
            }}
          />
          <p className="text-xs text-muted-foreground">
            Service charge applies after discount. Tax applies to the discounted
            room subtotal plus service charge.
          </p>
          <div>
            <h3 className="font-medium">Special requests</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm">
              {r.special_request || "None."}
            </p>
          </div>
          <div>
            <h3 className="font-medium">Staff notes</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm">
              {r.notes || "None."}
            </p>
          </div>
          {r.cancellation_reason && (
            <p className="rounded-lg bg-muted p-3 text-sm">
              Closure reason: {r.cancellation_reason}
            </p>
          )}
        </section>
        <aside className="space-y-6 rounded-xl border bg-card p-6">
          <ReservationStatusForm key={r.version} reservation={r} />
          {["CHECKED_IN", "CHECKED_OUT"].includes(r.status) && (
            <Link
              className="block underline"
              href={
                "/folios?status=all&q=" +
                encodeURIComponent(r.reservation_number)
              }
            >
              Open guest bill
            </Link>
          )}
          {r.status === "CONFIRMED" && (
            <CheckInForm
              key={"arrival-" + r.version}
              id={r.id}
              version={r.version}
              roomNumber={room.room_number}
            />
          )}
          {r.status === "CHECKED_IN" && (
            <Link href="/in-house" className="underline">
              View in-house guests
            </Link>
          )}
          <p className="text-sm text-muted-foreground">
            Confirm the booking before checking in. After arrival, open the
            guest bill to record payments and check out.
          </p>
        </aside>
      </div>
      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">Recent booking activity</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Latest 20 changes · WIB
        </p>
        <ul className="mt-4 divide-y">
          {activity.map((event) => (
            <li key={event.id} className="space-y-1 py-3 text-sm">
              <p className="font-medium">{event.action.replaceAll("_", " ")}</p>
              <p className="text-muted-foreground">
                {new Intl.DateTimeFormat("en-GB", {
                  timeZone: "Asia/Jakarta",
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(event.created_at))}
              </p>
              <p className="break-all text-xs text-muted-foreground">
                Staff ID: {event.user_id ?? "System"}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
