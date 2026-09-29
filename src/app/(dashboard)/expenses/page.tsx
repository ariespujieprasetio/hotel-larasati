// localized-ui
import { T, LocalizedInput } from "@/components/i18n/language-provider";
import Link from "next/link";
import { requireStaff } from "@/lib/services/auth";
import { getHotelSettings } from "@/lib/services/hotel";
import { reportDates, defaultReportDates } from "@/lib/payment-reports";
import { billingDate, billingPage } from "@/lib/billing";
import { money } from "@/lib/reservations";
import { ExpenseForm, VoidExpenseForm } from "@/components/expense-forms";
export const metadata = { title: "Expenses" };
export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const { supabase, profile } = await requireStaff();
  if (!["OWNER", "MANAGER", "FINANCE"].includes(profile.role))
    return (
      <p role="alert">
        <T>{"Your role cannot access expenses."}</T>
      </p>
    );
  const q = await searchParams;
  const defaults = defaultReportDates();
  const from = q.from ?? defaults.from;
  const to = q.to ?? defaults.to;
  const valid = reportDates.safeParse({ from, to });
  const status = ["active", "cancelled", "all"].includes(q.status ?? "")
    ? q.status!
    : "active";
  const page = billingPage(q.page);
  const hotel = await getHotelSettings();
  let query = supabase
    .from("expenses")
    .select("*", { count: "exact" })
    .gte("paid_on", from)
    .lte("paid_on", to);
  if (status === "active") query = query.is("voided_at", null);
  if (status === "cancelled") query = query.not("voided_at", "is", null);
  const data = valid.success
    ? await query
        .order("paid_on", { ascending: false })
        .order("created_at", { ascending: false })
        .order("id")
        .range((page - 1) * 20, page * 20 - 1)
    : null;
  const summary = valid.success
    ? await supabase.rpc("expense_summary", { p_from: from, p_to: to })
    : null;
  if (data?.error || summary?.error) throw new Error("Expenses unavailable");
  const href = (p: number) =>
    "?" + new URLSearchParams({ from, to, status, page: String(p) });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">
        <T>{"Expenses"}</T>
      </h1>
      <p>
        <T>
          {
            "Record money already paid. Cancellation corrects an incorrect record; it does not issue or record a refund. Original details and cancellation history are retained."
          }
        </T>
      </p>
      <ExpenseForm today={defaults.to} currency={hotel.default_currency} />
      <form className="flex flex-wrap items-end gap-3">
        <label>
          <T>{"From"}</T>
          <LocalizedInput
            type="date"
            name="from"
            required
            defaultValue={from}
            className="block rounded border p-2"
          />
        </label>
        <label>
          <T>{"Through"}</T>
          <LocalizedInput
            type="date"
            name="to"
            required
            defaultValue={to}
            className="block rounded border p-2"
          />
        </label>
        <select
          name="status"
          defaultValue={status}
          className="rounded border p-2"
        >
          {["active", "cancelled", "all"].map((s) => (
            <option key={s}>
              <T>{s}</T>
            </option>
          ))}
        </select>
        <button className="rounded border p-2">
          <T>{"Filter"}</T>
        </button>
      </form>
      {!valid.success && (
        <p role="alert">
          <T>{"Select valid dates in order, at most 366 days."}</T>
        </p>
      )}
      {summary && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">
            <T>{"Active expenses by currency and category"}</T>
          </h2>
          {summary.data?.length ? (
            summary.data.map((r) => (
              <p key={r.currency + r.category}>
                {r.currency} &middot; {r.category} &middot; {r.amount} (
                {r.entries}
                <T>{" entries)"}</T>
              </p>
            ))
          ) : (
            <p>
              <T>{"No active expenses in this period."}</T>
            </p>
          )}
          <Link
            href={"/reports/financial?" + new URLSearchParams({ from, to })}
            className="underline"
          >
            <T>{"Financial totals and CSV"}</T>
          </Link>
        </section>
      )}
      <div className="divide-y rounded-xl border">
        {data && !data.data.length && (
          <p className="p-5">
            <T>{"No expenses match this filter."}</T>
          </p>
        )}
        {data?.data.map((e) => (
          <article key={e.id} className="space-y-3 p-5">
            <h2 className="font-semibold">
              {e.paid_on} &middot; {e.category} &middot;<T> </T>
              {money(e.amount, e.currency)} {e.voided_at && "(Cancelled)"}
            </h2>
            <p className="whitespace-pre-wrap break-words">{e.description}</p>
            <p>
              {e.method}
              <T>{" \u00b7 Reference: "}</T>
              {e.reference || "Cash"}
            </p>
            <p className="break-all text-xs">
              <T>{"Recorded "}</T>
              {billingDate(e.created_at)}
              <T>{" WIB by "}</T>
              {e.created_by}
              <T> </T>
              <T>{"\u00b7 Entry "}</T>
              {e.id}
            </p>
            {e.voided_at ? (
              <p className="break-words">
                <T>{"Cancelled "}</T>
                {billingDate(e.voided_at)}
                <T>{" WIB by "}</T>
                {e.voided_by}:<T> </T>
                {e.void_reason}
              </p>
            ) : (
              ["OWNER", "MANAGER"].includes(profile.role) && (
                <VoidExpenseForm id={e.id} />
              )
            )}
          </article>
        ))}
      </div>
      <nav className="flex gap-4">
        {page > 1 && (
          <Link href={href(page - 1)}>
            <T>{"Previous"}</T>
          </Link>
        )}
        {page * 20 < (data?.count ?? 0) && (
          <Link href={href(page + 1)}>
            <T>{"Next"}</T>
          </Link>
        )}
      </nav>
    </div>
  );
}
