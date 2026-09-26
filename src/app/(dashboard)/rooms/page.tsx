import Link from "next/link";
import { requireStaff } from "@/lib/services/auth";
import { getRoomTypes, listRooms, parseRoomSearch } from "@/lib/services/rooms";
import { roomManageRoles, roomStatuses, statusLabel } from "@/lib/rooms";
import { StatusBadge } from "@/components/rooms/status-badge";
import { controlClass } from "@/components/rooms/form-fields";
import { Button } from "@/components/ui/button";
export const metadata = { title: "Rooms" };
export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = parseRoomSearch(await searchParams);
  const [{ profile }, types, { rooms, count }] = await Promise.all([
    requireStaff(),
    getRoomTypes(),
    listRooms(search),
  ]);
  const typeName = (id: string) =>
    types.find((t) => t.id === id)?.name ?? "Unknown type";
  const pageCount = Math.max(1, Math.ceil(count / 24));
  const href = (page: number) =>
    "/rooms?" +
    new URLSearchParams({ ...search, page: String(page) }).toString();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Rooms</h1>
          <p className="mt-2 text-muted-foreground">
            Room inventory and current readiness. Date-based availability comes
            with reservations.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/rooms/types">Room types</Link>
          </Button>
          {roomManageRoles.includes(profile.role) && (
            <Button asChild>
              <Link href="/rooms/new">Add room</Link>
            </Button>
          )}
        </div>
      </div>
      <form className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1 text-sm">
          Room number
          <input
            className={controlClass}
            name="q"
            defaultValue={search.q}
            placeholder="Search room number"
          />
        </label>
        <label className="space-y-1 text-sm">
          Status
          <select
            className={controlClass}
            name="status"
            defaultValue={search.status}
          >
            <option value="">All statuses</option>
            {roomStatuses.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          Room type
          <select
            name="type"
            className={controlClass}
            defaultValue={search.type}
          >
            <option value="">All room types</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          Inventory
          <select
            name="active"
            className={controlClass}
            defaultValue={search.active}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All rooms</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          Sort by
          <select
            name="sort"
            className={controlClass}
            defaultValue={search.sort}
          >
            <option value="room_number">Room number</option>
            <option value="floor">Floor</option>
            <option value="status">Status</option>
            <option value="updated_at">Recently updated</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          View
          <select
            name="view"
            className={controlClass}
            defaultValue={search.view}
          >
            <option value="board">Room board</option>
            <option value="table">Table</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <Button type="submit">Apply filters</Button>
          <Button asChild variant="ghost">
            <Link href="/rooms">Reset</Link>
          </Button>
        </div>
      </form>
      <p className="text-sm text-muted-foreground">
        {count} matching rooms · Page {search.page} of {pageCount}
      </p>
      {!rooms.length ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <h2 className="text-lg font-semibold">No rooms found</h2>
          <p className="mt-2 text-muted-foreground">
            Adjust your filters, or add a room type and your first room.
          </p>
        </div>
      ) : search.view === "board" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {rooms.map((room) => (
            <Link
              href={"/rooms/" + room.id}
              key={room.id}
              className="space-y-4 rounded-xl border bg-card p-5 transition hover:border-primary focus-visible:outline-2 focus-visible:outline-ring"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-2xl font-semibold">{room.room_number}</h2>
                {!room.is_active && (
                  <span className="text-xs text-muted-foreground">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {typeName(room.room_type_id)} · Floor {room.floor}
              </p>
              <StatusBadge status={room.status} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Rooms matching the selected filters
            </caption>
            <thead className="bg-muted">
              <tr>
                {["Room", "Type", "Floor", "Status", "Inventory"].map((h) => (
                  <th scope="col" className="p-4" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr className="border-t" key={room.id}>
                  <td className="p-4 font-semibold">
                    <Link className="underline" href={"/rooms/" + room.id}>
                      {room.room_number}
                    </Link>
                  </td>
                  <td className="p-4">{typeName(room.room_type_id)}</td>
                  <td className="p-4">{room.floor}</td>
                  <td className="p-4">
                    <StatusBadge status={room.status} />
                  </td>
                  <td className="p-4">
                    {room.is_active ? "Active" : "Inactive"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <nav aria-label="Room pagination" className="flex gap-3">
        {search.page > 1 && (
          <Button variant="outline" asChild>
            <Link href={href(search.page - 1)}>Previous</Link>
          </Button>
        )}
        {search.page < pageCount && (
          <Button variant="outline" asChild>
            <Link href={href(search.page + 1)}>Next</Link>
          </Button>
        )}
      </nav>
    </div>
  );
}
