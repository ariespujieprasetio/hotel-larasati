import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/services/auth";
import { getOperationalReport } from "@/lib/services/operational-reports";
import {
  reportKinds,
  reportDefinitions,
  operationalDates,
  type ReportKind,
} from "@/lib/operational-reports";
import { defaultReportDates } from "@/lib/payment-reports";
import { billingDate } from "@/lib/billing";
export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { kind } = await params;
  if (!reportKinds.includes(kind as ReportKind)) notFound();
  const k = kind as ReportKind;
  const { profile } = await requireStaff();
  if (!["OWNER", "MANAGER", "FINANCE"].includes(profile.role))
    return <p role="alert">Your role cannot access reports.</p>;
  const q = await searchParams;
  const defaults = defaultReportDates();
  const from = q.from ?? defaults.from;
  const to = q.to ?? defaults.to;
  const valid = operationalDates.safeParse({ from, to });
  const report = valid.success ? await getOperationalReport(k, from, to) : null;
  const def = reportDefinitions[k];
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{def.title}</h1>
      <p className="max-w-4xl text-sm leading-6">{def.description}</p>
      <form className="flex flex-wrap items-end gap-3">
        <label>
          From
          <input
            name="from"
            type="date"
            required
            defaultValue={from}
            max={defaults.to}
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
            max={defaults.to}
            className="mt-1 block rounded border p-2"
          />
        </label>
        <button className="rounded bg-primary px-4 py-2 text-primary-foreground">
          Show report
        </button>
      </form>
      {!valid.success && (
        <p role="alert">
          Choose valid dates in order, up to 366 days, ending no later than
          today WIB.
        </p>
      )}
      {report && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              {report.from} through {report.to} &middot; Generated{" "}
              {billingDate(report.generated_at)} WIB
            </p>
            <a
              className="rounded border px-4 py-2"
              href={
                "/reports/" + k + "/export?" + new URLSearchParams({ from, to })
              }
            >
              Export CSV
            </a>
          </div>
          {!report.rows.length ? (
            <p className="rounded border p-5">
              No matching activity or balances.
            </p>
          ) : (
            <div className="overflow-x-auto rounded border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    {def.columns.map(([key, label]) => (
                      <th key={key} className="whitespace-nowrap p-3">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((r, i) => (
                    <tr key={i} className="border-t">
                      {def.columns.map(([key]) => (
                        <td
                          key={key}
                          className="whitespace-nowrap p-3 tabular-nums"
                        >
                          {r[key] ?? "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
