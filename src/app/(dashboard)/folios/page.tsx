// localized-ui
import { T, LocalizedInput } from "@/components/i18n/language-provider";
import Link from "next/link";
import { listFolios } from "@/lib/services/billing";
import { billingPage } from "@/lib/billing";
import { money } from "@/lib/reservations";
export const metadata = { title: "Folios / Billing" };
export default async function FoliosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const page = billingPage(query.page);
  const status =
    typeof query.status === "string" && ["all", "closed"].includes(query.status)
      ? query.status!
      : "open";
  const q = typeof query.q === "string" ? query.q.slice(0, 80) : "";
  const { folios, count } = await listFolios(page, status, q);
  const href = (n: number) =>
    "?" + new URLSearchParams({ page: String(n), status, q }).toString();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">
        <T>{"Folios / Billing"}</T>
      </h1>
      <p className="text-muted-foreground">
        <T>
          {
            "Room bills open automatically at check-in. Review charges, record received payments, and settle departures."
          }
        </T>
      </p>
      <form className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <T>{"Reservation number"}</T>
          <LocalizedInput
            name="q"
            defaultValue={q}
            maxLength={80}
            className="mt-1 block h-10 rounded-md border px-3"
          />
        </label>
        <label className="text-sm">
          <T>{"Status"}</T>
          <select
            name="status"
            defaultValue={status}
            className="mt-1 block h-10 rounded-md border px-3"
          >
            <option value="open">
              <T>{"Open"}</T>
            </option>
            <option value="closed">
              <T>{"Closed"}</T>
            </option>
            <option value="all">
              <T>{"All"}</T>
            </option>
          </select>
        </label>
        <button className="h-10 rounded-md bg-primary px-4 text-primary-foreground">
          <T>{"Filter"}</T>
        </button>
      </form>
      <div className="divide-y rounded-xl border bg-card">
        {!folios.length && (
          <p className="p-6">
            <T>{"No bills match these filters."}</T>
          </p>
        )}
        {folios.map((f) => (
          <article
            key={f.id}
            className="flex flex-wrap justify-between gap-4 p-5"
          >
            <div>
              <Link
                className="font-semibold underline"
                href={"/folios/" + f.id}
              >
                {f.folio_number} &middot; {f.guest_name}
              </Link>
              <p className="mt-2 text-sm">
                {f.reservation_number}
                <T>{" \u00b7 Room "}</T>
                {f.room_number} &middot;<T> </T>
                <T>{f.closed_at ? "Closed" : "Open"}</T>
              </p>
            </div>
            <div className="text-sm">
              <p>
                <T>{"Total: "}</T>
                {money(f.total_amount, f.currency)}
              </p>
              <p className="mt-1 font-semibold">
                <T>{"Balance: "}</T>
                {money(f.balance, f.currency)}
              </p>
            </div>
          </article>
        ))}
      </div>
      <nav aria-label="Pagination" className="flex gap-4">
        {page > 1 && (
          <Link href={href(page - 1)}>
            <T>{"Previous"}</T>
          </Link>
        )}
        <span>
          <T>{"Page "}</T>
          {page}
        </span>
        {page * 20 < count && (
          <Link href={href(page + 1)}>
            <T>{"Next"}</T>
          </Link>
        )}
      </nav>
    </div>
  );
}
