import Link from "next/link";
import { listGuests } from "@/lib/services/guests";
import { parseGuestSearch } from "@/lib/validations/guests";
import { Button } from "@/components/ui/button";
const control = "mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm";
export const metadata = { title: "Guests" };
export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = parseGuestSearch(await searchParams);
  const { guests, count } = await listGuests(search);
  const pages = Math.max(1, Math.ceil(count / 20));
  const href = (page: number) =>
    "/guests?" + new URLSearchParams({ ...search, page: String(page) });
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Guests</h1>
          <p className="mt-2 text-muted-foreground">
            Find existing guests before creating a new record.
          </p>
        </div>
        <Button asChild>
          <Link href="/guests/new">Add guest</Link>
        </Button>
      </header>
      <form className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 xl:grid-cols-5">
        <label className="text-sm">
          Search
          <input
            name="q"
            defaultValue={search.q}
            maxLength={150}
            className={control}
            placeholder="Guest details"
          />
        </label>
        <label className="text-sm">
          Search by
          <select name="field" defaultValue={search.field} className={control}>
            <option value="full_name">Name</option>
            <option value="phone">Phone</option>
            <option value="id_number">Identity number</option>
            <option value="guest_code">Guest code</option>
          </select>
        </label>
        <label className="text-sm">
          Status
          <select
            name="active"
            defaultValue={search.active}
            className={control}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All guests</option>
          </select>
        </label>
        <label className="text-sm">
          Sort by
          <select name="sort" defaultValue={search.sort} className={control}>
            <option value="full_name">Name</option>
            <option value="created_at">Newest first</option>
            <option value="guest_code">Guest code</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <Button>Search</Button>
          <Button asChild variant="ghost">
            <Link href="/guests">Reset</Link>
          </Button>
        </div>
      </form>
      <p className="text-sm text-muted-foreground">
        {count} matching guests · Page {search.page} of {pages}
      </p>
      {guests.length ? (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Guest search results</caption>
            <thead className="bg-muted">
              <tr>
                {[
                  "Guest",
                  "Code",
                  "Phone",
                  "Email",
                  "Nationality",
                  "Status",
                ].map((h) => (
                  <th scope="col" key={h} className="p-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id} className="border-t">
                  <td className="p-4 font-medium">
                    <Link href={"/guests/" + guest.id} className="underline">
                      {guest.full_name}
                    </Link>
                  </td>
                  <td className="p-4 whitespace-nowrap">{guest.guest_code}</td>
                  <td className="p-4">{guest.phone || "—"}</td>
                  <td className="p-4">{guest.email || "—"}</td>
                  <td className="p-4">{guest.nationality || "—"}</td>
                  <td className="p-4">
                    {guest.is_active ? "Active" : "Inactive"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <section className="rounded-xl border bg-card p-10 text-center">
          <h2 className="text-lg font-semibold">No guests found</h2>
          <p className="mt-2 text-muted-foreground">
            Adjust the search or add your first guest.
          </p>
        </section>
      )}
      <nav aria-label="Guest pagination" className="flex gap-3">
        {search.page > 1 && (
          <Button asChild variant="outline">
            <Link href={href(search.page - 1)}>Previous</Link>
          </Button>
        )}
        {search.page < pages && (
          <Button asChild variant="outline">
            <Link href={href(search.page + 1)}>Next</Link>
          </Button>
        )}
      </nav>
    </div>
  );
}
