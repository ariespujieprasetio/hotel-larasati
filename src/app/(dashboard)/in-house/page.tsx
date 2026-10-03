// localized-ui
import { T } from "@/components/i18n/language-provider";
import Link from "next/link";
import { listStays } from "@/lib/services/stays";
import { jakartaDate } from "@/lib/guests";
import { RoomMoveForm } from "@/components/reservations/room-move-form";
export const metadata = { title: "In-house guests" };
export default async function InHousePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; checkedIn?: string }>;
}) {
  const query = await searchParams;
  const page = Math.max(1, Math.min(10000, Number(query.page) || 1)) | 0;
  const { stays, bookings, guests, rooms, count } = await listStays(page);
  const roomOptions = stays.length
    ? (
        await (
          await import("@/lib/services/auth")
        ).requireRole(["OWNER", "MANAGER", "FRONT_OFFICE"])
      ).supabase
        .from("rooms")
        .select("id,room_number,room_type_id")
        .eq("is_active", true)
        .in("status", ["AVAILABLE", "INSPECTED"])
    : null;
  const availableRooms = roomOptions ? ((await roomOptions).data ?? []) : [];
  const today = jakartaDate();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">
        <T>{"In-house guests"}</T>
      </h1>
      {query.checkedIn === "1" && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 p-4 text-emerald-900"
        >
          <T>{"Guest checked in successfully."}</T>
        </p>
      )}
      <p className="text-muted-foreground">
        {count}
        <T>
          {
            " occupied rooms. Arrival times shown in WIB. Open Check-out to settle a bill and record departure."
          }
        </T>
      </p>
      <Link href="/check-out" className="underline">
        <T>{"Review departures & bills"}</T>
      </Link>
      <div className="divide-y rounded-xl border bg-card">
        {!stays.length && (
          <p className="p-6">
            <T>{"No guests currently checked in."}</T>
          </p>
        )}
        {stays.map((s) => {
          const r = bookings.find((b) => b.id === s.reservation_id);
          return (
            <article key={s.id} className="space-y-2 p-5">
              <h2 className="font-semibold">
                <T>{"Room "}</T>
                {rooms.find((room) => room.id === s.room_id)?.room_number}
                <T> </T>· {guests.find((g) => g.id === r?.guest_id)?.full_name}
              </h2>
              <p className="text-sm">
                <T>{"Arrived"}</T>
                <T> </T>
                {new Intl.DateTimeFormat("en-GB", {
                  timeZone: "Asia/Jakarta",
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(s.checked_in_at))}
              </p>
              <p className="text-sm">
                <T>{"Expected departure: "}</T>
                {r?.check_out_date}
              </p>
              {r && r.check_out_date <= today && (
                <p className="text-sm text-amber-800">
                  <T>
                    {r.check_out_date < today
                      ? "Overdue departure — room remains occupied."
                      : "Departure due today."}
                  </T>
                </p>
              )}
              <Link
                className="text-sm underline"
                href={"/reservations/" + s.reservation_id}
              >
                <T>{"View reservation"}</T>
              </Link>
              <RoomMoveForm
                reservationId={s.reservation_id}
                version={r?.version ?? 0}
                rooms={availableRooms.filter(
                  (room) =>
                    room.room_type_id === r?.room_type_id &&
                    room.id !== s.room_id,
                )}
              />
            </article>
          );
        })}
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
