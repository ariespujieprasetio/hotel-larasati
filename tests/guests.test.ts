import { test } from "node:test";
import assert from "node:assert/strict";
import { guestSchema, parseGuestSearch } from "../src/lib/validations/guests";
import { jakartaDate, guestRoles } from "../src/lib/guests";
const guest = {
  full_name: "Guest Example",
  id_type: "OTHER",
  id_number: "",
  nationality: "",
  gender: "",
  date_of_birth: "",
  phone: "",
  email: "",
  address: "",
  company_name: "",
  notes: "",
  is_active: true,
};
test("minimum guest details accepted without invented identity data", () =>
  assert.ok(guestSchema.safeParse(guest).success));
test("KTP requires 16 digits when supplied", () => {
  for (const id_number of ["123", "123456789012345a", "12345678901234567"])
    assert.equal(
      guestSchema.safeParse({ ...guest, id_type: "KTP", id_number }).success,
      false,
    );
  assert.ok(
    guestSchema.safeParse({
      ...guest,
      id_type: "KTP",
      id_number: "1234567890123456",
    }).success,
  );
});
test("rejects invalid and future birth dates", () => {
  for (const date_of_birth of [
    "2025-02-30",
    "1899-12-31",
    "2999-01-01",
    "27/09/2000",
  ])
    assert.equal(
      guestSchema.safeParse({ ...guest, date_of_birth }).success,
      false,
    );
  assert.ok(
    guestSchema.safeParse({ ...guest, date_of_birth: "2000-02-29" }).success,
  );
});
test("uses the Jakarta calendar date near UTC midnight", () =>
  assert.equal(jakartaDate(new Date("2026-09-26T18:00:00Z")), "2026-09-27"));
test("contact validation rejects malformed values", () => {
  for (const patch of [
    { email: "not-email" },
    { phone: "------" },
    { phone: "hello123456" },
    { full_name: " " },
  ])
    assert.equal(guestSchema.safeParse({ ...guest, ...patch }).success, false);
  assert.ok(
    guestSchema.safeParse({
      ...guest,
      phone: "+62 (812) 123-456",
      email: "guest@example.com",
    }).success,
  );
});
test("guest edits require a version and strip client-owned totals/roles", () => {
  const id = "12345678-1234-4234-8234-123456789012";
  assert.equal(guestSchema.safeParse({ ...guest, id }).success, false);
  const parsed = guestSchema.parse({
    ...guest,
    id,
    version: 2,
    role: "OWNER",
    guest_code: "FORGED",
  });
  assert.equal("role" in parsed, false);
  assert.equal("guest_code" in parsed, false);
});
test("search allowlists fields and sorts, rejects invalid pages", () => {
  const parsed = parseGuestSearch({
    field: "notes",
    sort: "password",
    page: "1.5",
    active: "bad",
    q: "  Alice  ",
  });
  assert.equal(parsed.field, "full_name");
  assert.equal(parsed.sort, "full_name");
  assert.equal(parsed.page, 1);
  assert.equal(parsed.active, "active");
  assert.equal(parsed.q, "Alice");
  assert.equal(parseGuestSearch({ page: "Infinity" }).page, 1);
  assert.equal(
    parseGuestSearch({ field: "id_number", page: "2" }).field,
    "id_number",
  );
});
test("guest access excludes housekeeping and finance", () => {
  assert.ok(guestRoles.includes("FRONT_OFFICE"));
  assert.equal(guestRoles.includes("HOUSEKEEPING"), false);
  assert.equal(guestRoles.includes("FINANCE"), false);
});
