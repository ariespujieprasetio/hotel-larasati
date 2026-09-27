import { test } from "node:test";
import assert from "node:assert/strict";
import {
  paymentSchema,
  checkoutSchema,
  reversalSchema,
} from "../src/lib/validations/billing";
const valid = {
  folioId: "60000000-0000-4000-8000-000000000001",
  requestId: "60000000-0000-4000-8000-000000000002",
  amount: "12345.67",
  method: "CASH",
  reference: "",
};
test("payment input preserves cents and rejects ambiguous or out-of-range amounts", () => {
  assert.equal(paymentSchema.parse(valid).amount, 12345.67);
  for (const amount of [
    "0",
    "-1",
    "1.001",
    "1e3",
    "12,345",
    "NaN",
    "Infinity",
    "1000000000000",
    "",
  ])
    assert.equal(
      paymentSchema.safeParse({ ...valid, amount }).success,
      false,
      amount,
    );
});
test("non-cash receipts require a transaction reference", () => {
  for (const method of ["CARD", "BANK_TRANSFER", "QRIS"]) {
    assert.equal(paymentSchema.safeParse({ ...valid, method }).success, false);
    assert.equal(
      paymentSchema.safeParse({ ...valid, method, reference: "BANK-123" })
        .success,
      true,
    );
  }
});
test("payment requests require stable identifiers and reversals require a reason", () => {
  assert.equal(
    paymentSchema.safeParse({ ...valid, requestId: undefined }).success,
    false,
  );
  assert.equal(
    reversalSchema.safeParse({ paymentId: valid.requestId, reason: "  " })
      .success,
    false,
  );
});
test("checkout requires the reviewed bill version", () => {
  assert.equal(
    checkoutSchema.safeParse({ folioId: valid.folioId }).success,
    false,
  );
  assert.equal(
    checkoutSchema.safeParse({ folioId: valid.folioId, version: 0 }).success,
    false,
  );
  assert.equal(
    checkoutSchema.safeParse({ folioId: valid.folioId, version: 2 }).success,
    true,
  );
});
