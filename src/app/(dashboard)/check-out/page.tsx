import Link from "next/link";
import { listStays } from "@/lib/services/stays";
import { requireRole } from "@/lib/services/auth";
import { reservationRoles } from "@/lib/reservations";
import { billingPage } from "@/lib/billing";
import { jakartaDate } from "@/lib/guests";
export const metadata = { title: "Check-out" };
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = billingPage((await searchParams).page);
  const { stays, bookings, guests, rooms, count } = await listStays(page);
  const { supabase } = await requireRole(reservationRoles);
  const folios = stays.length
    ? await supabase
        .from("folios")
        .select("id,reservation_id")
        .in(
          "reservation_id",
          stays.map((s) => s.reservation_id),
        )
    : { data: [], error: null };
  if (folios.error) throw new Error("Departure bills could not be loaded.");
  const today = jakartaDate();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Check-out</h1>
      <p className="text-muted-foreground">
        Review the guest bill and settle all room charges before departure.
        Early departure retains the agreed booking total.
      </p>
      <div className="divide-y rounded-xl border bg-card">
        {!stays.length && (
          <p className="p-6">No guests currently checked in.</p>
        )}
        {stays.map((s) => {
          const r = bookings.find((b) => b.id === s.reservation_id);
          const f = folios.data?.find(
            (f) => f.reservation_id === s.reservation_id,
          );
          return (
            <article key={s.id} className="space-y-2 p-5">
              <h2 className="font-semibold">
                Room {rooms.find((r) => r.id === s.room_id)?.room_number}{" "}
                &middot; {guests.find((g) => g.id === r?.guest_id)?.full_name}
              </h2>
              <p className="text-sm">
                Expected departure: {r?.check_out_date}
                {r && r.check_out_date <= today
                  ? " \u00b7 Due for departure"
                  : ""}
              </p>
              {f ? (
                <Link className="underline" href={"/folios/" + f.id}>
                  Review bill & check out
                </Link>
              ) : (
                <p role="alert">
                  Bill unavailable. Contact your administrator.
                </p>
              )}
            </article>
          );
        })}
      </div>
      <nav aria-label="Pagination" className="flex gap-4">
        {page > 1 && <Link href={"?page=" + (page - 1)}>Previous</Link>}
        <span>Page {page}</span>
        {page * 20 < count && <Link href={"?page=" + (page + 1)}>Next</Link>}
      </nav>
    </div>
  );
}
