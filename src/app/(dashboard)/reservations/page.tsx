import Link from "next/link";
import {
  listReservations,
  parseReservationSearch,
} from "@/lib/services/reservations";
import { reservationStatuses, money } from "@/lib/reservations";
import { ReservationBadge } from "@/components/reservations/status-badge";
import { Button } from "@/components/ui/button";
export const metadata = { title: "Reservations" };
const control = "mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm";
export default async function ReservationList({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = parseReservationSearch(await searchParams);
  const { reservations, guests, rooms, count } = await listReservations(search);
  const pages = Math.max(1, Math.ceil(count / 20));
  const url = (page: number) =>
    "/reservations?" + new URLSearchParams({ ...search, page: String(page) });
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Reservations</h1>
          <p className="mt-2 text-muted-foreground">
            Bookings, room assignments and scheduled arrivals.
          </p>
        </div>
        <Button asChild>
          <Link href="/reservations/new">New reservation</Link>
        </Button>
      </header>
      <form className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 xl:grid-cols-3">
        <label className="text-sm">
          Reservation number
          <input name="q" defaultValue={search.q} className={control} />
        </label>
        <label className="text-sm">
          Status
          <select
            name="status"
            defaultValue={search.status}
            className={control}
          >
            <option value="">All statuses</option>
            {reservationStatuses.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Arrival from
          <input
            type="date"
            name="from"
            defaultValue={search.from}
            className={control}
          />
        </label>
        <label className="text-sm">
          Arrival through
          <input
            type="date"
            name="to"
            defaultValue={search.to}
            className={control}
          />
        </label>
        <label className="text-sm">
          Sort by
          <select name="sort" defaultValue={search.sort} className={control}>
            <option value="check_in_date">Arrival date</option>
            <option value="created_at">Newest booking</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <Button>Apply filters</Button>
          <Button variant="ghost" asChild>
            <Link href="/reservations">Reset</Link>
          </Button>
        </div>
      </form>
      <p className="text-sm text-muted-foreground">
        {count} reservations · Page {search.page} of {pages}
      </p>
      {reservations.length ? (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Reservation search results</caption>
            <thead className="bg-muted">
              <tr>
                {[
                  "Booking",
                  "Guest",
                  "Room",
                  "Check-in",
                  "Check-out",
                  "Status",
                  "Total",
                ].map((h) => (
                  <th className="p-4" scope="col" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-4 font-medium">
                    <Link className="underline" href={"/reservations/" + r.id}>
                      {r.reservation_number}
                    </Link>
                  </td>
                  <td className="p-4">
                    {guests.find((g) => g.id === r.guest_id)?.full_name ??
                      "Guest"}
                  </td>
                  <td className="p-4">
                    {rooms.find((room) => room.id === r.room_id)?.room_number ??
                      "—"}
                  </td>
                  <td className="p-4 whitespace-nowrap">{r.check_in_date}</td>
                  <td className="p-4 whitespace-nowrap">{r.check_out_date}</td>
                  <td className="p-4">
                    <ReservationBadge status={r.status} />
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {money(r.total_amount, r.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <section className="rounded-xl border bg-card p-10 text-center">
          <h2 className="text-lg font-semibold">No reservations found</h2>
          <p className="mt-2 text-muted-foreground">
            Create a booking or adjust the filters.
          </p>
        </section>
      )}
      <nav aria-label="Reservation pagination" className="flex gap-3">
        {search.page > 1 && (
          <Button variant="outline" asChild>
            <Link href={url(search.page - 1)}>Previous</Link>
          </Button>
        )}
        {search.page < pages && (
          <Button variant="outline" asChild>
            <Link href={url(search.page + 1)}>Next</Link>
          </Button>
        )}
      </nav>
    </div>
  );
}
