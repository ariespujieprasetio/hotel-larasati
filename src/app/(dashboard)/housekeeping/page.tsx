import Link from "next/link";
import {
  listHousekeeping,
  parseHousekeepingSearch,
} from "@/lib/services/housekeeping";
import { housekeepingStatuses } from "@/lib/housekeeping";
export const metadata = { title: "Housekeeping" };
export default async function HousekeepingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = parseHousekeepingSearch(await searchParams);
  const { tasks, count } = await listHousekeeping(search);
  const href = (page: number) =>
    "?" + new URLSearchParams({ ...search, page: String(page) }).toString();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Housekeeping</h1>
      <p className="text-muted-foreground">
        Cleaning tasks follow room readiness automatically. Assign staff, record
        notes, and prepare rooms for arrival.
      </p>
      <form className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          Room number
          <input
            name="q"
            maxLength={12}
            defaultValue={search.q}
            className="mt-1 block h-10 rounded-md border px-3"
          />
        </label>
        <label className="text-sm">
          Status
          <select
            name="status"
            defaultValue={search.status}
            className="mt-1 block h-10 rounded-md border px-3"
          >
            <option value="active">Active jobs</option>
            {housekeepingStatuses.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Assignment
          <select
            name="assignment"
            defaultValue={search.assignment}
            className="mt-1 block h-10 rounded-md border px-3"
          >
            <option value="all">All staff</option>
            <option value="mine">Assigned to me</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </label>
        <button className="h-10 rounded-md bg-primary px-4 text-primary-foreground">
          Filter
        </button>
      </form>
      <div className="divide-y rounded-xl border bg-card">
        {!tasks.length && (
          <p className="p-6">
            No housekeeping jobs match these filters. Jobs appear when rooms
            need cleaning.
          </p>
        )}
        {tasks.map((t) => (
          <article
            key={t.id}
            className="flex flex-wrap justify-between gap-4 p-5"
          >
            <div>
              <Link
                href={"/housekeeping/" + t.id}
                className="font-semibold underline"
              >
                Room {t.room_number}
              </Link>
              <p className="mt-2 text-sm">
                {t.assigned_to ? t.assignee_name : "Unassigned"}
              </p>
            </div>
            <p className="text-sm font-medium">
              {t.status.replaceAll("_", " ")}
            </p>
          </article>
        ))}
      </div>
      <nav className="flex gap-4" aria-label="Pagination">
        {search.page > 1 && <Link href={href(search.page - 1)}>Previous</Link>}
        <span>Page {search.page}</span>
        {search.page * 20 < count && (
          <Link href={href(search.page + 1)}>Next</Link>
        )}
      </nav>
    </div>
  );
}
