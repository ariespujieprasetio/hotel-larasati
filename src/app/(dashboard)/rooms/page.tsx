// localized-ui
import { T, LocalizedInput } from "@/components/i18n/language-provider";
import Link from "next/link";
import { BedDouble, ArrowUpRight, Plus } from "lucide-react";
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
          <h1 className="text-3xl font-semibold">
            <T>{"Rooms"}</T>
          </h1>
          <p className="mt-2 text-muted-foreground">
            <T>
              {
                "Every room, ready for its next chapter. Manage inventory and readiness."
              }
            </T>
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/rooms/types">
              <T>{"Room types"}</T>
            </Link>
          </Button>
          {roomManageRoles.includes(profile.role) && (
            <Button asChild>
              <Link href="/rooms/new">
                <Plus className="size-4" />
                <T>{"Add room"}</T>
              </Link>
            </Button>
          )}
        </div>
      </div>
      <form className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1 text-sm">
          <T>{"Room number"}</T>
          <LocalizedInput
            className={controlClass}
            name="q"
            defaultValue={search.q}
            placeholder="Search room number"
          />
        </label>
        <label className="space-y-1 text-sm">
          <T>{"Status"}</T>
          <select
            className={controlClass}
            name="status"
            defaultValue={search.status}
          >
            <option value="">
              <T>{"All statuses"}</T>
            </option>
            {roomStatuses.map((s) => (
              <option key={s} value={s}>
                <T>{statusLabel(s)}</T>
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <T>{"Room type"}</T>
          <select
            name="type"
            className={controlClass}
            defaultValue={search.type}
          >
            <option value="">
              <T>{"All room types"}</T>
            </option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <T>{"Inventory"}</T>
          <select
            name="active"
            className={controlClass}
            defaultValue={search.active}
          >
            <option value="active">
              <T>{"Active"}</T>
            </option>
            <option value="inactive">
              <T>{"Inactive"}</T>
            </option>
            <option value="all">
              <T>{"All rooms"}</T>
            </option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <T>{"Sort by"}</T>
          <select
            name="sort"
            className={controlClass}
            defaultValue={search.sort}
          >
            <option value="room_number">
              <T>{"Room number"}</T>
            </option>
            <option value="floor">
              <T>{"Floor"}</T>
            </option>
            <option value="status">
              <T>{"Status"}</T>
            </option>
            <option value="updated_at">
              <T>{"Recently updated"}</T>
            </option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <T>{"View"}</T>
          <select
            name="view"
            className={controlClass}
            defaultValue={search.view}
          >
            <option value="board">
              <T>{"Room board"}</T>
            </option>
            <option value="table">
              <T>{"Table"}</T>
            </option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <Button type="submit">
            <T>{"Apply filters"}</T>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/rooms">
              <T>{"Reset"}</T>
            </Link>
          </Button>
        </div>
      </form>
      <p className="text-sm text-muted-foreground">
        {count}
        <T>{" matching rooms · Page "}</T>
        {search.page}
        <T>{" of "}</T>
        {pageCount}
      </p>
      {!rooms.length ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <h2 className="text-lg font-semibold">
            <T>{"No rooms found"}</T>
          </h2>
          <p className="mt-2 text-muted-foreground">
            <T>
              {"Adjust your filters, or add a room type and your first room."}
            </T>
          </p>
        </div>
      ) : search.view === "board" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {rooms.map((room) => (
            <Link
              href={"/rooms/" + room.id}
              key={room.id}
              className="group space-y-4 rounded-xl border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-ring"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex size-10 items-center justify-center rounded-lg bg-secondary/60 text-primary">
                  <BedDouble className="size-5" />
                </span>
                <ArrowUpRight className="ml-auto size-4 text-muted-foreground/50 group-hover:text-primary" />
                {!room.is_active && (
                  <span className="text-xs text-muted-foreground">
                    <T>{"Inactive"}</T>
                  </span>
                )}
              </div>
              <h2 className="font-serif text-3xl">{room.room_number}</h2>
              <p className="text-sm text-muted-foreground">
                {typeName(room.room_type_id)}
                <T>{" · Floor "}</T>
                {room.floor}
              </p>
              <StatusBadge status={room.status} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              <T>{"Rooms matching the selected filters"}</T>
            </caption>
            <thead className="bg-muted">
              <tr>
                {["Room", "Type", "Floor", "Status", "Inventory"].map((h) => (
                  <th scope="col" className="p-4" key={h}>
                    <T>{h}</T>
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
                    <T>{room.is_active ? "Active" : "Inactive"}</T>
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
            <Link href={href(search.page - 1)}>
              <T>{"Previous"}</T>
            </Link>
          </Button>
        )}
        {search.page < pageCount && (
          <Button variant="outline" asChild>
            <Link href={href(search.page + 1)}>
              <T>{"Next"}</T>
            </Link>
          </Button>
        )}
      </nav>
    </div>
  );
}
