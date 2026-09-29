// localized-ui
import { T } from "@/components/i18n/language-provider";
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
      <h1 className="text-3xl font-semibold">
        <T>{"Check-out"}</T>
      </h1>
      <p className="text-muted-foreground">
        <T>
          {
            "Review the guest bill and settle room and extra charges before departure. Early departure retains the agreed booking total."
          }
        </T>
      </p>
      <div className="divide-y rounded-xl border bg-card">
        {!stays.length && (
          <p className="p-6">
            <T>{"No guests currently checked in."}</T>
          </p>
        )}
        {stays.map((s) => {
          const r = bookings.find((b) => b.id === s.reservation_id);
          const f = folios.data?.find(
            (f) => f.reservation_id === s.reservation_id,
          );
          return (
            <article key={s.id} className="space-y-2 p-5">
              <h2 className="font-semibold">
                <T>{"Room "}</T>
                {rooms.find((r) => r.id === s.room_id)?.room_number}
                <T> </T>
                &middot; {guests.find((g) => g.id === r?.guest_id)?.full_name}
              </h2>
              <p className="text-sm">
                <T>{"Expected departure: "}</T>
                {r?.check_out_date}
                <T>
                  {r && r.check_out_date <= today
                    ? " \u00b7 Due for departure"
                    : ""}
                </T>
              </p>
              {f ? (
                <Link className="underline" href={"/folios/" + f.id}>
                  <T>{"Review bill & check out"}</T>
                </Link>
              ) : (
                <p role="alert">
                  <T>{"Bill unavailable. Contact your administrator."}</T>
                </p>
              )}
            </article>
          );
        })}
      </div>
      <nav aria-label="Pagination" className="flex gap-4">
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
