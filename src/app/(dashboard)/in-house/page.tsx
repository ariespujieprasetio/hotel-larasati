import Link from "next/link";
import { listStays } from "@/lib/services/stays";
import { jakartaDate } from "@/lib/guests";
export const metadata = { title: "In-house guests" };
export default async function InHousePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; checkedIn?: string }>;
}) {
  const query = await searchParams;
  const page = Math.max(1, Math.min(10000, Number(query.page) || 1)) | 0;
  const { stays, bookings, guests, rooms, count } = await listStays(page);
  const today = jakartaDate();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">In-house guests</h1>
      {query.checkedIn === "1" && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 p-4 text-emerald-900"
        >
          Guest checked in successfully.
        </p>
      )}
      <p className="text-muted-foreground">
        {count} occupied rooms. Arrival times shown in WIB. Checkout and billing
        will be available in the next phase.
      </p>
      <div className="divide-y rounded-xl border bg-card">
        {!stays.length && (
          <p className="p-6">No guests currently checked in.</p>
        )}
        {stays.map((s) => {
          const r = bookings.find((b) => b.id === s.reservation_id);
          return (
            <article key={s.id} className="space-y-2 p-5">
              <h2 className="font-semibold">
                Room {rooms.find((room) => room.id === s.room_id)?.room_number}{" "}
                · {guests.find((g) => g.id === r?.guest_id)?.full_name}
              </h2>
              <p className="text-sm">
                Arrived{" "}
                {new Intl.DateTimeFormat("en-GB", {
                  timeZone: "Asia/Jakarta",
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(s.checked_in_at))}
              </p>
              <p className="text-sm">Expected departure: {r?.check_out_date}</p>
              {r && r.check_out_date <= today && (
                <p className="text-sm text-amber-800">
                  {r.check_out_date < today
                    ? "Overdue departure — room remains occupied."
                    : "Departure due today."}
                </p>
              )}
              <Link
                className="text-sm underline"
                href={"/reservations/" + s.reservation_id}
              >
                View reservation
              </Link>
            </article>
          );
        })}
      </div>
      <nav className="flex gap-4" aria-label="Pagination">
        {page > 1 && <Link href={"?page=" + (page - 1)}>Previous</Link>}
        <span>Page {page}</span>
        {page * 20 < count && <Link href={"?page=" + (page + 1)}>Next</Link>}
      </nav>
    </div>
  );
}
