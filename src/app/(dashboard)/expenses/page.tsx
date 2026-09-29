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
    return <p role="alert">Your role cannot access expenses.</p>;
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
      <h1 className="text-3xl font-semibold">Expenses</h1>
      <p>
        Record money already paid. Cancellation corrects an incorrect record; it
        does not issue or record a refund. Original details and cancellation
        history are retained.
      </p>
      <ExpenseForm today={defaults.to} currency={hotel.default_currency} />
      <form className="flex flex-wrap items-end gap-3">
        <label>
          From
          <input
            type="date"
            name="from"
            required
            defaultValue={from}
            className="block rounded border p-2"
          />
        </label>
        <label>
          Through
          <input
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
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="rounded border p-2">Filter</button>
      </form>
      {!valid.success && (
        <p role="alert">Select valid dates in order, at most 366 days.</p>
      )}
      {summary && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">
            Active expenses by currency and category
          </h2>
          {summary.data?.length ? (
            summary.data.map((r) => (
              <p key={r.currency + r.category}>
                {r.currency} &middot; {r.category} &middot; {r.amount} (
                {r.entries} entries)
              </p>
            ))
          ) : (
            <p>No active expenses in this period.</p>
          )}
          <Link
            href={"/reports/financial?" + new URLSearchParams({ from, to })}
            className="underline"
          >
            Financial totals and CSV
          </Link>
        </section>
      )}
      <div className="divide-y rounded-xl border">
        {data && !data.data.length && (
          <p className="p-5">No expenses match this filter.</p>
        )}
        {data?.data.map((e) => (
          <article key={e.id} className="space-y-3 p-5">
            <h2 className="font-semibold">
              {e.paid_on} &middot; {e.category} &middot;{" "}
              {money(e.amount, e.currency)} {e.voided_at && "(Cancelled)"}
            </h2>
            <p className="whitespace-pre-wrap break-words">{e.description}</p>
            <p>
              {e.method} &middot; Reference: {e.reference || "Cash"}
            </p>
            <p className="break-all text-xs">
              Recorded {billingDate(e.created_at)} WIB by {e.created_by}{" "}
              &middot; Entry {e.id}
            </p>
            {e.voided_at ? (
              <p className="break-words">
                Cancelled {billingDate(e.voided_at)} WIB by {e.voided_by}:{" "}
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
        {page > 1 && <Link href={href(page - 1)}>Previous</Link>}
        {page * 20 < (data?.count ?? 0) && (
          <Link href={href(page + 1)}>Next</Link>
        )}
      </nav>
    </div>
  );
}
