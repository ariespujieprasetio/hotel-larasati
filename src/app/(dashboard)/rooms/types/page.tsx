import Link from "next/link";
import { getRoomTypes } from "@/lib/services/rooms";
import { requireStaff } from "@/lib/services/auth";
import { roomManageRoles } from "@/lib/rooms";
import { Button } from "@/components/ui/button";
export const metadata = { title: "Room types" };
export default async function RoomTypesPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    q?: string;
    active?: string;
    page?: string;
  }>;
}) {
  const [types, { profile }, params] = await Promise.all([
    getRoomTypes(),
    requireStaff(),
    searchParams,
  ]);
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const active = params.active === "all" ? "all" : "active";
  const filtered = types.filter(
    (t) =>
      (active === "all" || t.is_active) &&
      t.name.toLowerCase().includes(q.toLowerCase()),
  );
  const page = Math.max(
    1,
    Math.min(Math.ceil(filtered.length / 12) || 1, Number(params.page) || 1),
  );
  const current = filtered.slice((page - 1) * 12, page * 12);
  const url = (p: number) =>
    "/rooms/types?" + new URLSearchParams({ q, active, page: String(p) });
  return (
    <div className="space-y-6">
      <Link href="/rooms" className="text-sm underline">
        Back to rooms
      </Link>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Room types</h1>
        {roomManageRoles.includes(profile.role) && (
          <Button asChild>
            <Link href="/rooms/types/new">Add room type</Link>
          </Button>
        )}
      </div>
      {params.saved === "1" && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 p-4 text-emerald-900"
        >
          Room type saved successfully.
        </p>
      )}
      <form className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <label className="text-sm">
          Search by name
          <input
            name="q"
            defaultValue={q}
            className="ml-2 rounded-md border p-2"
          />
        </label>
        <label className="text-sm">
          Inventory
          <select
            name="active"
            defaultValue={active}
            className="ml-2 rounded-md border p-2"
          >
            <option value="active">Active</option>
            <option value="all">All types</option>
          </select>
        </label>
        <Button>Search</Button>
      </form>
      <p className="text-sm text-muted-foreground">
        {filtered.length} room types · Sorted by name
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {current.map((type) => (
          <article
            key={type.id}
            className="space-y-3 rounded-xl border bg-card p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">{type.name}</h2>
              <span className="text-xs">
                {type.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {type.capacity} guests · {type.bed_type}
            </p>
            <p className="font-semibold">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(type.base_price)}{" "}
              <span className="text-sm font-normal">/ night</span>
            </p>
            <p className="text-sm whitespace-pre-wrap">
              {type.description || "No description."}
            </p>
            <p className="text-sm text-muted-foreground">
              {type.amenities.join(" · ") || "No amenities listed"}
            </p>
            {roomManageRoles.includes(profile.role) && (
              <Button variant="outline" asChild>
                <Link href={"/rooms/types/" + type.id + "/edit"}>
                  Edit type
                </Link>
              </Button>
            )}
          </article>
        ))}
      </div>
      {!filtered.length && (
        <p className="rounded-xl border bg-card p-8 text-center">
          No room types found. Add your first room type or adjust the filters.
        </p>
      )}
      <nav aria-label="Room type pagination" className="flex gap-3">
        {page > 1 && (
          <Link className="underline" href={url(page - 1)}>
            Previous
          </Link>
        )}
        {page * 12 < filtered.length && (
          <Link className="underline" href={url(page + 1)}>
            Next
          </Link>
        )}
      </nav>
    </div>
  );
}
