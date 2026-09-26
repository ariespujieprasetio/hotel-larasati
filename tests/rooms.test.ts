import { test } from "node:test";
import assert from "node:assert/strict";
import { roomSchema, roomTypeSchema } from "../src/lib/validations/rooms";
import { statusOptions } from "../src/lib/rooms";
const room = {
  room_number: "101",
  room_type_id: "12345678-1234-4234-8234-123456789012",
  floor: 1,
  notes: "",
  is_active: true,
};
const type = {
  name: "Standard",
  description: "",
  base_price: 250000,
  capacity: 2,
  bed_type: "Twin",
  size: 20,
  amenities: "AC, Wi-Fi",
  is_active: true,
};
test("valid inventory inputs are accepted", () => {
  assert.ok(roomSchema.safeParse(room).success);
  assert.ok(roomTypeSchema.safeParse(type).success);
});
test("invalid room identifiers and floors are rejected", () => {
  for (const patch of [
    { room_number: "101/2" },
    { room_type_id: "invalid" },
    { floor: 1.5 },
    { floor: 201 },
  ])
    assert.equal(roomSchema.safeParse({ ...room, ...patch }).success, false);
});
test("editing requires a version to detect stale writes", () => {
  assert.equal(
    roomSchema.safeParse({ ...room, id: room.room_type_id }).success,
    false,
  );
  assert.ok(
    roomSchema.safeParse({ ...room, id: room.room_type_id, version: 1 })
      .success,
  );
});
test("invalid prices and capacities are rejected", () => {
  for (const patch of [
    { base_price: -1 },
    { base_price: 1.001 },
    { capacity: 0 },
    { capacity: 2.5 },
    { size: -1 },
  ])
    assert.equal(
      roomTypeSchema.safeParse({ ...type, ...patch }).success,
      false,
    );
});
test("housekeeping follows the cleaning sequence", () => {
  assert.deepEqual(statusOptions("DIRTY", "HOUSEKEEPING"), ["CLEANING"]);
  assert.deepEqual(statusOptions("CLEANING", "HOUSEKEEPING"), ["CLEAN"]);
  assert.deepEqual(statusOptions("CLEAN", "HOUSEKEEPING"), ["INSPECTED"]);
  assert.deepEqual(statusOptions("INSPECTED", "HOUSEKEEPING"), ["AVAILABLE"]);
  assert.deepEqual(statusOptions("AVAILABLE", "HOUSEKEEPING"), []);
});
test("front office and finance cannot manually change status", () => {
  assert.deepEqual(statusOptions("DIRTY", "FRONT_OFFICE"), []);
  assert.deepEqual(statusOptions("DIRTY", "FINANCE"), []);
});
test("reservation-managed statuses cannot be manually assigned or cleared", () => {
  assert.deepEqual(statusOptions("OCCUPIED", "OWNER"), []);
  assert.deepEqual(statusOptions("RESERVED", "MANAGER"), []);
  assert.ok(!statusOptions("AVAILABLE", "OWNER").includes("OCCUPIED"));
  assert.ok(!statusOptions("AVAILABLE", "OWNER").includes("RESERVED"));
});
