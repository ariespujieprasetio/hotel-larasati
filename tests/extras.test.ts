import { test } from "node:test";
import assert from "node:assert/strict";
import { extraSchema, voidExtraSchema } from "../src/lib/validations/billing";
const valid = {
  folioId: "60000000-0000-4000-8000-000000000001",
  requestId: "60000000-0000-4000-8000-000000000002",
  version: 1,
  description: "Laundry",
  quantity: 2,
  unitPrice: "12500.25",
};
test("extra charges require integer quantities and positive cent prices", () => {
  assert.equal(extraSchema.parse(valid).unitPrice, 12500.25);
  for (const unitPrice of ["0", "-1", "1.001", "1e4", "NaN"])
    assert.equal(extraSchema.safeParse({ ...valid, unitPrice }).success, false);
  for (const quantity of [0, 1.5, 1001])
    assert.equal(extraSchema.safeParse({ ...valid, quantity }).success, false);
  assert.equal(
    extraSchema.safeParse({
      ...valid,
      quantity: 1000,
      unitPrice: "999999999999.99",
    }).success,
    false,
  );
});
test("extra changes require review versions, identifiers and cancellation reasons", () => {
  assert.equal(extraSchema.safeParse({ ...valid, version: 0 }).success, false);
  assert.equal(
    extraSchema.safeParse({ ...valid, requestId: "bad" }).success,
    false,
  );
  assert.equal(
    voidExtraSchema.safeParse({
      extraId: valid.requestId,
      version: 1,
      reason: " ",
    }).success,
    false,
  );
  assert.equal(
    voidExtraSchema.safeParse({
      extraId: valid.requestId,
      version: 1,
      reason: "Duplicate entry",
    }).success,
    true,
  );
});
