import { test } from "node:test";
import assert from "node:assert/strict";
import { nightsBetween } from "../src/lib/reservations";
import {
  previewSchema,
  reservationSchema,
  reservationStatusSchema,
} from "../src/lib/validations/reservations";
const id = "12345678-1234-4234-8234-123456789012";
const input = {
  room_type_id: id,
  check_in_date: "2026-09-25",
  check_out_date: "2026-09-27",
  adults: 2,
  children: 0,
  discount_amount: 0,
  guest_id: id,
  room_id: "",
  source: "DIRECT",
  status: "CONFIRMED",
  special_request: "",
  notes: "",
  expected_total: 500000,
  expected_currency: "IDR",
};
test("nights are calendar days independent of DST", () => {
  assert.equal(nightsBetween("2026-09-25", "2026-09-27"), 2);
  assert.equal(nightsBetween("2026-03-07", "2026-03-09"), 2);
  assert.equal(nightsBetween("2028-02-28", "2028-03-01"), 2);
});
test("reject reversed, same day and overly long dates", () => {
  for (const check_out_date of ["2026-09-24", "2026-09-25", "2027-09-27"])
    assert.equal(
      previewSchema.safeParse({ ...input, check_out_date }).success,
      false,
    );
});
test("invalid party counts and fractional discounts rejected", () => {
  for (const patch of [
    { adults: 0 },
    { children: -1 },
    { adults: 1.5 },
    { discount_amount: 1.001 },
  ])
    assert.equal(
      reservationSchema.safeParse({ ...input, ...patch }).success,
      false,
    );
});
test("automatic and specific room assignment accepted", () => {
  assert.ok(reservationSchema.safeParse(input).success);
  assert.ok(reservationSchema.safeParse({ ...input, room_id: id }).success);
});
test("cannot create checked-in reservations or edit without a version", () => {
  assert.equal(
    reservationSchema.safeParse({ ...input, status: "CHECKED_IN" }).success,
    false,
  );
  assert.equal(reservationSchema.safeParse({ ...input, id }).success, false);
});
test("cancellation requires a reason and a version", () => {
  assert.equal(
    reservationStatusSchema.safeParse({
      id,
      version: 1,
      status: "CANCELLED",
      reason: "",
    }).success,
    false,
  );
  assert.ok(
    reservationStatusSchema.safeParse({
      id,
      version: 1,
      status: "CANCELLED",
      reason: "Guest request",
    }).success,
  );
  assert.equal(
    reservationStatusSchema.safeParse({
      id,
      version: 1,
      status: "CHECKED_IN",
      reason: "",
    }).success,
    false,
  );
});
