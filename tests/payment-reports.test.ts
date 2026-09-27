import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defaultReportDates,
  reportDates,
  paymentReportCsv,
} from "../src/lib/payment-reports";
test("payment report uses Jakarta month boundaries and valid bounded dates", () => {
  assert.deepEqual(defaultReportDates(new Date("2026-09-30T17:00:00Z")), {
    from: "2026-10-01",
    to: "2026-10-01",
  });
  for (const d of [
    { from: "2026-02-30", to: "2026-03-01" },
    { from: "2026-09-28", to: "2026-09-27" },
    { from: "2025-01-01", to: "2026-01-02" },
  ])
    assert.equal(reportDates.safeParse(d).success, false);
  assert.equal(
    reportDates.safeParse({ from: "2026-09-28", to: "2026-09-28" }).success,
    true,
  );
});
test("CSV preserves exact decimal strings, currency groups and negative reversals", () => {
  const csv = paymentReportCsv({
    from: "2026-09-28",
    to: "2026-09-28",
    generated_at: "2026-09-28T00:00:00Z",
    totals: [],
    methods: [
      {
        currency: "IDR",
        method: "CASH",
        entries: 1,
        received: "0",
        reversed: "123.45",
        net: "-123.45",
      },
      {
        currency: "USD",
        method: "CARD",
        entries: 1,
        received: "999999999999.99",
        reversed: "0",
        net: "999999999999.99",
      },
    ],
  });
  assert.equal(csv.charCodeAt(0), 0xfeff);
  assert.ok(csv.includes('"-123.45"'));
  assert.ok(csv.includes('"999999999999.99"'));
  assert.equal(csv.split("\r\n").length, 4);
});
