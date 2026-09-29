// localized-ui
import { T, LocalizedInput } from "@/components/i18n/language-provider";
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
          <h1 className="text-3xl font-semibold">
            <T>{"Reservations"}</T>
          </h1>
          <p className="mt-2 text-muted-foreground">
            <T>{"Bookings, room assignments and scheduled arrivals."}</T>
          </p>
        </div>
        <Button asChild>
          <Link href="/reservations/new">
            <T>{"New reservation"}</T>
          </Link>
        </Button>
      </header>
      <form className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 xl:grid-cols-3">
        <label className="text-sm">
          <T>{"Reservation number"}</T>
          <LocalizedInput
            name="q"
            defaultValue={search.q}
            className={control}
          />
        </label>
        <label className="text-sm">
          <T>{"Status"}</T>
          <select
            name="status"
            defaultValue={search.status}
            className={control}
          >
            <option value="">
              <T>{"All statuses"}</T>
            </option>
            <T>
              {reservationStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </T>
          </select>
        </label>
        <label className="text-sm">
          <T>{"Arrival from"}</T>
          <LocalizedInput
            type="date"
            name="from"
            defaultValue={search.from}
            className={control}
          />
        </label>
        <label className="text-sm">
          <T>{"Arrival through"}</T>
          <LocalizedInput
            type="date"
            name="to"
            defaultValue={search.to}
            className={control}
          />
        </label>
        <label className="text-sm">
          <T>{"Sort by"}</T>
          <select name="sort" defaultValue={search.sort} className={control}>
            <option value="check_in_date">
              <T>{"Arrival date"}</T>
            </option>
            <option value="created_at">
              <T>{"Newest booking"}</T>
            </option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <Button>
            <T>{"Apply filters"}</T>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/reservations">
              <T>{"Reset"}</T>
            </Link>
          </Button>
        </div>
      </form>
      <p className="text-sm text-muted-foreground">
        {count}
        <T>{" reservations · Page "}</T>
        {search.page}
        <T>{" of "}</T>
        {pages}
      </p>
      {reservations.length ? (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              <T>{"Reservation search results"}</T>
            </caption>
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
                    <T>{h}</T>
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
          <h2 className="text-lg font-semibold">
            <T>{"No reservations found"}</T>
          </h2>
          <p className="mt-2 text-muted-foreground">
            <T>{"Create a booking or adjust the filters."}</T>
          </p>
        </section>
      )}
      <nav aria-label="Reservation pagination" className="flex gap-3">
        {search.page > 1 && (
          <Button variant="outline" asChild>
            <Link href={url(search.page - 1)}>
              <T>{"Previous"}</T>
            </Link>
          </Button>
        )}
        {search.page < pages && (
          <Button variant="outline" asChild>
            <Link href={url(search.page + 1)}>
              <T>{"Next"}</T>
            </Link>
          </Button>
        )}
      </nav>
    </div>
  );
}
