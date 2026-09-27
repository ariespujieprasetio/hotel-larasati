import { test } from "node:test";
import assert from "node:assert/strict";
import { hotelSettingsSchema } from "../src/lib/validations/hotel-settings";
const valid = {
  version: 1,
  hotel_name: "Hotel",
  address: "",
  phone: "",
  email: "",
  check_in_time: "14:00",
  check_out_time: "12:00",
  default_currency: "idr",
  tax_percentage: "11",
  service_charge_percentage: "5.25",
  reservation_prefix: "res",
};
test("hotel settings normalize codes and validate times and percentages", () => {
  const result = hotelSettingsSchema.parse(valid);
  assert.equal(result.default_currency, "IDR");
  assert.equal(result.reservation_prefix, "RES");
  assert.equal(result.service_charge_percentage, 5.25);
  for (const patch of [
    { version: 0 },
    { hotel_name: " " },
    { check_in_time: "24:00" },
    { check_out_time: "12:60" },
    { tax_percentage: "101" },
    { tax_percentage: "-1" },
    { service_charge_percentage: "1.001" },
    { email: "bad" },
    { reservation_prefix: "bad space" },
  ])
    assert.equal(
      hotelSettingsSchema.safeParse({ ...valid, ...patch }).success,
      false,
    );
});
