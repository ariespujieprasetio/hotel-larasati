import { test } from "node:test";
import assert from "node:assert/strict";
import {
  staffCreateSchema,
  staffUpdateSchema,
} from "../src/lib/validations/staff";
const input = {
  full_name: "Test staff",
  phone: "",
  email: "staff@example.invalid",
  password: "testing-only-Long-Password",
  role: "HOUSEKEEPING",
  is_active: true,
  verified: true,
};
test("staff creation requires verified email and a sufficiently long password", () => {
  assert.equal(staffCreateSchema.safeParse(input).success, true);
  assert.equal(
    staffCreateSchema.safeParse({ ...input, verified: false }).success,
    false,
  );
  assert.equal(
    staffCreateSchema.safeParse({ ...input, password: "short" }).success,
    false,
  );
  assert.equal(
    staffCreateSchema.safeParse({ ...input, email: "invalid" }).success,
    false,
  );
});
test("password byte limit prevents silently truncated credentials", () => {
  assert.equal(
    staffCreateSchema.safeParse({ ...input, password: "x".repeat(72) }).success,
    true,
  );
  assert.equal(
    staffCreateSchema.safeParse({ ...input, password: "x".repeat(73) }).success,
    false,
  );
  assert.equal(
    staffCreateSchema.safeParse({ ...input, password: "\u00e9".repeat(37) })
      .success,
    false,
  );
});
test("staff updates require a known role, boolean status and reviewed version", () => {
  const v = {
    id: "90000000-0000-4000-8000-000000000004",
    version: 2,
    full_name: "Test",
    phone: "",
    role: "HOUSEKEEPING",
    is_active: false,
  };
  assert.equal(staffUpdateSchema.safeParse(v).success, true);
  assert.equal(
    staffUpdateSchema.safeParse({ ...v, version: undefined }).success,
    false,
  );
  assert.equal(
    staffUpdateSchema.safeParse({ ...v, role: "ADMIN" }).success,
    false,
  );
  assert.equal(
    staffUpdateSchema.safeParse({ ...v, is_active: "false" }).success,
    false,
  );
});
