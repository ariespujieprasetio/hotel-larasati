// localized-ui
import { T, LocalizedInput } from "@/components/i18n/language-provider";
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
          <h1 className="text-3xl font-semibold">
            <T>{"Guests"}</T>
          </h1>
          <p className="mt-2 text-muted-foreground">
            <T>{"Find existing guests before creating a new record."}</T>
          </p>
        </div>
        <Button asChild>
          <Link href="/guests/new">
            <T>{"Add guest"}</T>
          </Link>
        </Button>
      </header>
      <form className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 xl:grid-cols-5">
        <label className="text-sm">
          <T>{"Search"}</T>
          <LocalizedInput
            name="q"
            defaultValue={search.q}
            maxLength={150}
            className={control}
            placeholder="Guest details"
          />
        </label>
        <label className="text-sm">
          <T>{"Search by"}</T>
          <select name="field" defaultValue={search.field} className={control}>
            <option value="full_name">
              <T>{"Name"}</T>
            </option>
            <option value="phone">
              <T>{"Phone"}</T>
            </option>
            <option value="id_number">
              <T>{"Identity number"}</T>
            </option>
            <option value="guest_code">
              <T>{"Guest code"}</T>
            </option>
          </select>
        </label>
        <label className="text-sm">
          <T>{"Status"}</T>
          <select
            name="active"
            defaultValue={search.active}
            className={control}
          >
            <option value="active">
              <T>{"Active"}</T>
            </option>
            <option value="inactive">
              <T>{"Inactive"}</T>
            </option>
            <option value="all">
              <T>{"All guests"}</T>
            </option>
          </select>
        </label>
        <label className="text-sm">
          <T>{"Sort by"}</T>
          <select name="sort" defaultValue={search.sort} className={control}>
            <option value="full_name">
              <T>{"Name"}</T>
            </option>
            <option value="created_at">
              <T>{"Newest first"}</T>
            </option>
            <option value="guest_code">
              <T>{"Guest code"}</T>
            </option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <Button>
            <T>{"Search"}</T>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/guests">
              <T>{"Reset"}</T>
            </Link>
          </Button>
        </div>
      </form>
      <p className="text-sm text-muted-foreground">
        {count}
        <T>{" matching guests · Page "}</T>
        {search.page}
        <T>{" of "}</T>
        {pages}
      </p>
      {guests.length ? (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              <T>{"Guest search results"}</T>
            </caption>
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
                    <T>{h}</T>
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
                    <T>{guest.is_active ? "Active" : "Inactive"}</T>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <section className="rounded-xl border bg-card p-10 text-center">
          <h2 className="text-lg font-semibold">
            <T>{"No guests found"}</T>
          </h2>
          <p className="mt-2 text-muted-foreground">
            <T>{"Adjust the search or add your first guest."}</T>
          </p>
        </section>
      )}
      <nav aria-label="Guest pagination" className="flex gap-3">
        {search.page > 1 && (
          <Button asChild variant="outline">
            <Link href={href(search.page - 1)}>
              <T>{"Previous"}</T>
            </Link>
          </Button>
        )}
        {search.page < pages && (
          <Button asChild variant="outline">
            <Link href={href(search.page + 1)}>
              <T>{"Next"}</T>
            </Link>
          </Button>
        )}
      </nav>
    </div>
  );
}
