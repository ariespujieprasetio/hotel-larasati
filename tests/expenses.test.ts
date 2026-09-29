import { test } from "node:test";
import assert from "node:assert/strict";
import { expenseSchema } from "../src/lib/expenses";
const valid = {
  id: "b0000000-0000-4000-8000-000000000001",
  paid_on: "2026-09-29",
  category: "REPAIRS",
  amount: "123.45",
  currency: "idr",
  method: "CASH",
  description: "AC repair",
  reference: "",
};
test("expense validation preserves cents and rejects invalid payment details", () => {
  assert.equal(expenseSchema.parse(valid).amount, 123.45);
  assert.equal(expenseSchema.parse(valid).currency, "IDR");
  for (const amount of ["0", "-1", "0.001", "NaN", "1e3"])
    assert.equal(expenseSchema.safeParse({ ...valid, amount }).success, false);
  assert.equal(
    expenseSchema.safeParse({ ...valid, method: "BANK_TRANSFER" }).success,
    false,
  );
  assert.equal(
    expenseSchema.safeParse({ ...valid, paid_on: "2026-02-30" }).success,
    false,
  );
});
