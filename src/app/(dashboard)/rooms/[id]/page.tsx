import Link from "next/link";
import { requireStaff } from "@/lib/services/auth";
import { getRoom, getRoomTypes, getRoomHistory } from "@/lib/services/rooms";
import { roomManageRoles } from "@/lib/rooms";
import { StatusBadge } from "@/components/rooms/status-badge";
import { StatusForm } from "@/components/rooms/status-form";
import { Button } from "@/components/ui/button";
export const metadata = { title: "Room details" };
export default async function RoomDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const [room, types, history, { profile }, query] = await Promise.all([
    getRoom(id),
    getRoomTypes(),
    getRoomHistory(id),
    requireStaff(),
    searchParams,
  ]);
  const type = types.find((t) => t.id === room.room_type_id);
  return (
    <div className="space-y-6">
      <Link href="/rooms" className="text-sm underline">
        Back to rooms
      </Link>
      {query.saved === "1" && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 p-4 text-emerald-900"
        >
          Changes saved successfully.
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Room {room.room_number}</h1>
        {roomManageRoles.includes(profile.role) && (
          <Button asChild>
            <Link href={"/rooms/" + id + "/edit"}>Edit room</Link>
          </Button>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-5 rounded-xl border bg-card p-6 lg:col-span-2">
          <StatusBadge status={room.status} />
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              ["Room type", type?.name ?? "Unknown"],
              ["Floor", room.floor],
              ["Capacity", type?.capacity ?? "—"],
              ["Bed type", type?.bed_type ?? "—"],
              [
                "Base rate",
                type
                  ? new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(type.base_price)
                  : "—",
              ],
              ["Inventory", room.is_active ? "Active" : "Inactive"],
              ["Size", type?.size ? type.size + " m²" : "Unspecified"],
              ["Amenities", type?.amenities.join(", ") || "None listed"],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="mt-1 font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t pt-4">
            <h2 className="font-medium">Operational notes</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm">
              {room.notes || "No notes."}
            </p>
          </div>
        </section>
        <section className="rounded-xl border bg-card p-6">
          <StatusForm key={room.version} room={room} role={profile.role} />
        </section>
      </div>
      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Latest 20 changes · Times shown in WIB
        </p>
        <ul className="mt-4 divide-y">
          {history.map((event) => (
            <li key={event.id} className="py-3 text-sm">
              <p className="font-medium">
                {event.action === "CREATE" ? "Room created" : "Room updated"}
                {event.old_data?.status !== event.new_data.status &&
                event.old_data
                  ? " · " +
                    String(event.old_data.status) +
                    " → " +
                    String(event.new_data.status)
                  : ""}
              </p>
              <p className="mt-1 text-muted-foreground">
                {new Intl.DateTimeFormat("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Jakarta",
                }).format(new Date(event.created_at))}
              </p>
              <p className="mt-1 break-all text-xs text-muted-foreground">
                Staff ID: {event.user_id ?? "System / deleted account"}
              </p>
            </li>
          ))}
        </ul>
        {!history.length && (
          <p className="mt-4 text-sm">No recorded changes.</p>
        )}
      </section>
    </div>
  );
}
