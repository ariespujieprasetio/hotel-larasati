import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLocale, translate } from "../src/lib/i18n/messages";
import { paymentReportCsv } from "../src/lib/payment-reports";

test("locale is allowlisted and defaults to Indonesian", () => {
  assert.equal(parseLocale("en"), "en");
  for (const value of [undefined, "id", "fr", "<script>"])
    assert.equal(parseLocale(value), "id");
});
test("UI translations preserve whitespace, status values and English source", () => {
  assert.equal(translate("id", " Rooms "), " Kamar ");
  assert.equal(translate("en", " Rooms "), " Rooms ");
  assert.equal(translate("id", "CHECKED_IN"), "Sudah check-in");
  assert.equal(translate("id", "Ayu Prasetio"), "Ayu Prasetio");
  assert.equal(
    translate("id", "25.0% of 4 active rooms"),
    "25.0% dari 4 kamar aktif",
  );
  assert.equal(
    translate("id", "Enter your password."),
    "Masukkan kata sandi Anda.",
  );
});
test("localized CSV changes headings and method labels without altering amounts", () => {
  const report = {
    from: "2026-09-01",
    to: "2026-09-29",
    generated_at: "2026-09-29T00:00:00Z",
    totals: [],
    methods: [
      {
        currency: "IDR",
        method: "BANK_TRANSFER",
        entries: 1,
        received: "1234567890.12",
        reversed: "0",
        net: "1234567890.12",
      },
    ],
  };
  const csv = paymentReportCsv(report, "id");
  assert.ok(csv.includes('"Mata uang"'));
  assert.ok(csv.includes('"Transfer bank"'));
  assert.ok(csv.includes('"1234567890.12"'));
  assert.ok(paymentReportCsv(report, "en").includes('"Currency"'));
});
