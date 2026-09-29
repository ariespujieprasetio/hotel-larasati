// localized-ui
import { T } from "@/components/i18n/language-provider";
import Link from "next/link";
import { jakartaDate } from "@/lib/guests";
import { listReservations } from "@/lib/services/reservations";
export const metadata = { title: "Check-in" };
export default async function CheckInPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const query = await searchParams;
  const page = Math.max(1, Math.min(10000, Number(query.page) || 1)) | 0;
  const today = jakartaDate();
  const { reservations, guests, rooms, count } = await listReservations({
    q: "",
    status: "CONFIRMED",
    from: "",
    to: today,
    page,
    sort: "check_in_date",
  });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">
        <T>{"Check-in"}</T>
      </h1>
      <p className="text-muted-foreground">
        <T>
          {
            "Confirmed arrivals due today or earlier (WIB). Open a booking to review guest details and check in. Confirm pending bookings in Reservations first."
          }
        </T>
      </p>
      <Link href="/reservations" className="underline">
        <T>{"All reservations"}</T>
      </Link>
      <div className="divide-y rounded-xl border bg-card">
        {!reservations.length && (
          <p className="p-6">
            <T>{"No confirmed arrivals to review."}</T>
          </p>
        )}
        {reservations.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-4 p-5"
          >
            <div>
              <Link
                className="font-semibold underline"
                href={"/reservations/" + r.id}
              >
                {r.reservation_number} ·<T> </T>
                {guests.find((g) => g.id === r.guest_id)?.full_name}
              </Link>
              <p className="mt-2 text-sm">
                <T>{"Room "}</T>
                {rooms.find((room) => room.id === r.room_id)?.room_number}
                <T> </T>· {r.check_in_date}
                <T>{" to "}</T>
                {r.check_out_date}
              </p>
              {r.check_out_date <= today && (
                <p className="mt-1 text-sm text-destructive">
                  <T>
                    {"Departure date has passed. Review dates or mark no-show."}
                  </T>
                </p>
              )}
            </div>
            <Link className="text-sm underline" href={"/reservations/" + r.id}>
              <T>{"Review arrival"}</T>
            </Link>
          </div>
        ))}
      </div>
      <nav className="flex gap-4" aria-label="Pagination">
        {page > 1 && (
          <Link href={"?page=" + (page - 1)}>
            <T>{"Previous"}</T>
          </Link>
        )}
        <span>
          <T>{"Page "}</T>
          {page}
        </span>
        {page * 20 < count && (
          <Link href={"?page=" + (page + 1)}>
            <T>{"Next"}</T>
          </Link>
        )}
      </nav>
    </div>
  );
}
