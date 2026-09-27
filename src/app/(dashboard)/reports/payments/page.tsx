import Link from "next/link";
import { requireStaff } from "@/lib/services/auth";
import { getPaymentReport } from "@/lib/services/payment-reports";
import { defaultReportDates, reportDates } from "@/lib/payment-reports";
import { billingDate } from "@/lib/billing";
export const metadata = { title: "Payment report" };
export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { profile } = await requireStaff();
  if (!["OWNER", "MANAGER", "FINANCE"].includes(profile.role))
    return (
      <section role="alert">Your role cannot access payment reports.</section>
    );
  const q = await searchParams;
  const defaults = defaultReportDates();
  const from = q.from ?? defaults.from;
  const to = q.to ?? defaults.to;
  const valid = reportDates.safeParse({ from, to });
  const report = valid.success ? await getPaymentReport(from, to) : null;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Payment report</h1>
      <p>
        Recorded receipts minus reversals, by payment entry date in
        Asia/Jakarta. This report measures recorded payments, not earned revenue
        or bank settlement.
      </p>
      <form className="flex flex-wrap items-end gap-3">
        <label>
          From
          <input
            name="from"
            type="date"
            required
            defaultValue={from}
            className="mt-1 block rounded border p-2"
          />
        </label>
        <label>
          Through
          <input
            name="to"
            type="date"
            required
            defaultValue={to}
            className="mt-1 block rounded border p-2"
          />
        </label>
        <button className="rounded bg-primary px-4 py-2 text-primary-foreground">
          Show report
        </button>
      </form>
      {!valid.success && (
        <p role="alert">Enter valid dates in order, up to 366 days.</p>
      )}
      {report && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              {report.from} through {report.to}, inclusive &middot; Updated{" "}
              {billingDate(report.generated_at)} WIB
            </p>
            <a
              href={
                "/reports/payments/export?" + new URLSearchParams({ from, to })
              }
              className="rounded border px-4 py-2"
            >
              Export CSV (by method)
            </a>
          </div>
          {!report.totals.length ? (
            <p className="rounded border p-5">
              No payments or reversals recorded in this period.
            </p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {report.totals.map((r) => (
                  <section
                    key={r.currency}
                    className="space-y-2 rounded-xl border bg-card p-5"
                  >
                    <h2 className="text-xl font-semibold">{r.currency}</h2>
                    <p>{r.entries} ledger entries</p>
                    <dl>
                      <div>Received: {r.received}</div>
                      <div>Reversed: {r.reversed}</div>
                      <div className="font-semibold">Net received: {r.net}</div>
                    </dl>
                  </section>
                ))}
              </div>
              <div className="overflow-x-auto rounded border">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      {[
                        "Currency",
                        "Method",
                        "Entries",
                        "Received",
                        "Reversed",
                        "Net received",
                      ].map((t) => (
                        <th key={t} className="p-3">
                          {t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.methods.map((r) => (
                      <tr key={r.currency + r.method} className="border-t">
                        <td className="p-3">{r.currency}</td>
                        <td className="p-3">{r.method.replaceAll("_", " ")}</td>
                        <td className="p-3">{r.entries}</td>
                        <td className="p-3">{r.received}</td>
                        <td className="p-3">{r.reversed}</td>
                        <td className="p-3">{r.net}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <p className="text-sm text-muted-foreground">
            Currencies are kept separate. Reversals are counted on their own
            recording date, so a period can have negative net receipts. CSV
            contains all method groups for the selected period; it is not an
            individual transaction export.
          </p>
          <Link href="/payments" className="underline">
            View individual payment history
          </Link>
        </>
      )}
    </div>
  );
}
