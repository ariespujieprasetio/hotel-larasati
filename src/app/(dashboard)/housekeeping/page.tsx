// localized-ui
import { T, LocalizedInput } from "@/components/i18n/language-provider";
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
      <h1 className="text-3xl font-semibold">
        <T>{"Housekeeping"}</T>
      </h1>
      <p className="text-muted-foreground">
        <T>
          {
            "Cleaning tasks follow room readiness automatically. Assign staff, record notes, and prepare rooms for arrival."
          }
        </T>
      </p>
      <form className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <T>{"Room number"}</T>
          <LocalizedInput
            name="q"
            maxLength={12}
            defaultValue={search.q}
            className="mt-1 block h-10 rounded-md border px-3"
          />
        </label>
        <label className="text-sm">
          <T>{"Status"}</T>
          <select
            name="status"
            defaultValue={search.status}
            className="mt-1 block h-10 rounded-md border px-3"
          >
            <option value="active">
              <T>{"Active jobs"}</T>
            </option>
            <T>
              {housekeepingStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </T>
          </select>
        </label>
        <label className="text-sm">
          <T>{"Assignment"}</T>
          <select
            name="assignment"
            defaultValue={search.assignment}
            className="mt-1 block h-10 rounded-md border px-3"
          >
            <option value="all">
              <T>{"All staff"}</T>
            </option>
            <option value="mine">
              <T>{"Assigned to me"}</T>
            </option>
            <option value="unassigned">
              <T>{"Unassigned"}</T>
            </option>
          </select>
        </label>
        <button className="h-10 rounded-md bg-primary px-4 text-primary-foreground">
          <T>{"Filter"}</T>
        </button>
      </form>
      <div className="divide-y rounded-xl border bg-card">
        {!tasks.length && (
          <p className="p-6">
            <T>
              {
                "No housekeeping jobs match these filters. Jobs appear when rooms need cleaning."
              }
            </T>
          </p>
        )}
        <T>
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
        </T>
      </div>
      <nav className="flex gap-4" aria-label="Pagination">
        {search.page > 1 && (
          <Link href={href(search.page - 1)}>
            <T>{"Previous"}</T>
          </Link>
        )}
        <span>
          <T>{"Page "}</T>
          {search.page}
        </span>
        {search.page * 20 < count && (
          <Link href={href(search.page + 1)}>
            <T>{"Next"}</T>
          </Link>
        )}
      </nav>
    </div>
  );
}
