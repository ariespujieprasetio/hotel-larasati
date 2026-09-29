import { reportDates, defaultReportDates } from "@/lib/payment-reports";
import { translate, type Locale } from "@/lib/i18n/messages";
export const reportKinds = ["occupancy", "revenue", "financial"] as const;
export type ReportKind = (typeof reportKinds)[number];
export type OperationalReport = {
  kind: ReportKind;
  from: string;
  to: string;
  generated_at: string;
  rows: Record<string, string | number | null>[];
};
export const operationalDates = reportDates.refine(
  (v) => v.to <= defaultReportDates().to,
  "Reports cannot include future dates.",
);
export const reportDefinitions: Record<
  ReportKind,
  { title: string; description: string; columns: [string, string][] }
> = {
  occupancy: {
    title: "Occupancy report",
    description:
      "Occupied rooms immediately before midnight WIB for past days; today uses the generation time. Capacity is reconstructed from room activity and includes all active rooms, including maintenance. Same-day stays appear in check-ins/check-outs but may not be occupied at the snapshot. A dash means zero recorded capacity.",
    columns: [
      ["date", "Date (WIB)"],
      ["occupied", "Occupied at snapshot"],
      ["active_rooms", "Active rooms at snapshot"],
      ["occupancy_pct", "Occupancy (%)"],
      ["check_ins", "Actual check-ins"],
      ["check_outs", "Actual check-outs"],
    ],
  },
  revenue: {
    title: "Revenue / closed bills",
    description:
      "Agreed room charges and active extras on folios closed during the selected period, grouped by closing date. Includes tax/service and is not nightly earned revenue or cash receipts. TOTAL rows summarize each currency; do not add totals to daily rows.",
    columns: [
      ["date", "Closing date (WIB)"],
      ["currency", "Currency"],
      ["bills", "Closed bills"],
      ["room_subtotal", "Room subtotal"],
      ["discount", "Discount"],
      ["service", "Service"],
      ["tax", "Tax"],
      ["extras", "Extras (final prices)"],
      ["billed_total", "Billed total"],
    ],
  },
  financial: {
    title: "Financial reports",
    description:
      "Receipts, reversals and closed bills use the selected period. Open bills and outstanding balances are CURRENT at generation time, not historical balances at the period end. Currencies are separate. Expenses use the entered payment date. Cancelled mistakes are excluded, including from past periods. Net cash flow is receipts minus reversals and expenses; it is not accounting profit.",
    columns: [
      ["currency", "Currency"],
      ["received", "Period receipts"],
      ["reversed", "Period reversals"],
      ["net_received", "Period net receipts"],
      ["expenses", "Period expenses"],
      ["net_cash_flow", "Recorded net cash flow"],
      ["closed_bill_total", "Period closed bills"],
      ["open_bills_now", "Open bills NOW"],
      ["outstanding_now", "Outstanding NOW"],
    ],
  },
};
export function operationalCsv(
  report: OperationalReport,
  locale: Locale = "en",
) {
  const cols = reportDefinitions[report.kind].columns;
  const rows = [
    [
      "From (WIB)",
      "Through (WIB)",
      "Generated at (UTC)",
      ...cols.map((c) => c[1]),
    ].map((heading) => translate(locale, heading)),
    ...report.rows.map((r) => [
      report.from,
      report.to,
      report.generated_at,
      ...cols.map(([key]) => r[key] ?? ""),
    ]),
  ];
  return (
    "\uFEFF" +
    rows
      .map((row) =>
        row.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(","),
      )
      .join("\r\n") +
    "\r\n"
  );
}
