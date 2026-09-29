// localized-ui
import { T, LocalizedInput } from "@/components/i18n/language-provider";
import Link from "next/link";
import { listStaff, parseStaffSearch } from "@/lib/services/staff";
import { staffRoles } from "@/lib/staff";
import { Button } from "@/components/ui/button";
export const metadata = { title: "Staff accounts" };
export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = parseStaffSearch(await searchParams);
  const { staff, count, profile } = await listStaff(search);
  const href = (page: number) =>
    "?" + new URLSearchParams({ ...search, page: String(page) }).toString();
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">
            <T>{"Staff accounts"}</T>
          </h1>
          <p className="mt-2 text-muted-foreground">
            <T>
              {
                "Manage access for hotel staff. Only owners can create or change accounts."
              }
            </T>
          </p>
        </div>
        {profile.role === "OWNER" && (
          <Button asChild>
            <Link href="/users/new">
              <T>{"Add staff"}</T>
            </Link>
          </Button>
        )}
      </header>
      <form className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <T>{"Staff name"}</T>
          <LocalizedInput
            name="q"
            defaultValue={search.q}
            maxLength={150}
            className="mt-1 block h-10 rounded-md border px-3"
          />
        </label>
        <label className="text-sm">
          <T>{"Role"}</T>
          <select
            name="role"
            defaultValue={search.role}
            className="mt-1 block h-10 rounded-md border px-3"
          >
            <option value="all">
              <T>{"All roles"}</T>
            </option>
            {staffRoles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <T>{"Access"}</T>
          <select
            name="active"
            defaultValue={search.active}
            className="mt-1 block h-10 rounded-md border px-3"
          >
            <option value="all">
              <T>{"All accounts"}</T>
            </option>
            <option value="active">
              <T>{"Active"}</T>
            </option>
            <option value="inactive">
              <T>{"Inactive"}</T>
            </option>
          </select>
        </label>
        <button className="h-10 rounded-md bg-primary px-4 text-primary-foreground">
          <T>{"Filter"}</T>
        </button>
      </form>
      <div className="divide-y rounded-xl border bg-card">
        {!staff.length && (
          <p className="p-6">
            <T>{"No matching staff accounts."}</T>
          </p>
        )}
        <T>
          {staff.map((s) => (
            <article
              key={s.id}
              className="flex flex-wrap justify-between gap-4 p-5"
            >
              <div>
                <Link
                  className="font-semibold underline"
                  href={"/users/" + s.id}
                >
                  {s.full_name}
                </Link>
                <p className="mt-1 break-all text-sm">{s.email}</p>
              </div>
              <p className="text-sm">
                {s.role.replaceAll("_", " ")} &middot;{" "}
                {s.is_active ? "Active" : "Inactive"}
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
