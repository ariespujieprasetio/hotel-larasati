import { z } from "zod";
export const reportDates = z
  .object({ from: z.iso.date(), to: z.iso.date() })
  .refine((v) => {
    const days = (Date.parse(v.to) - Date.parse(v.from)) / 86400000;
    return days >= 0 && days <= 365;
  }, "Choose an ordered period of at most 366 days.");
export function defaultReportDates(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (name: string) => parts.find((p) => p.type === name)!.value;
  const to = part("year") + "-" + part("month") + "-" + part("day");
  return { from: to.slice(0, 8) + "01", to };
}
export type PaymentReportRow = {
  currency: string;
  entries: number;
  received: string;
  reversed: string;
  net: string;
};
export type PaymentReport = {
  from: string;
  to: string;
  generated_at: string;
  totals: PaymentReportRow[];
  methods: (PaymentReportRow & { method: string })[];
};
export function paymentReportCsv(report: PaymentReport) {
  const rows: (string | number)[][] = [
    [
      "From (WIB)",
      "Through (WIB)",
      "Generated at (UTC)",
      "Currency",
      "Method",
      "Entries",
      "Received",
      "Reversed",
      "Net received",
    ],
    ...report.methods.map((r) => [
      report.from,
      report.to,
      report.generated_at,
      r.currency,
      r.method,
      r.entries,
      r.received,
      r.reversed,
      r.net,
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
