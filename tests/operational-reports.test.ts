import { test } from "node:test";
import assert from "node:assert/strict";
import {
  operationalCsv,
  operationalDates,
  reportDefinitions,
} from "../src/lib/operational-reports";
test("operational CSV follows report columns and retains null capacity and exact amounts", () => {
  const csv = operationalCsv({
    kind: "occupancy",
    from: "2026-01-01",
    to: "2026-01-01",
    generated_at: "2026-01-02T00:00:00Z",
    rows: [
      {
        date: "2026-01-01",
        occupied: 0,
        active_rooms: 0,
        occupancy_pct: null,
        check_ins: 0,
        check_outs: 0,
      },
    ],
  });
  assert.equal(csv.charCodeAt(0), 0xfeff);
  assert.equal(csv.split("\r\n").length, 3);
  assert.ok(csv.includes('"0","0","","0","0"'));
  assert.equal(
    reportDefinitions.financial.columns.at(-1)?.[0],
    "outstanding_now",
  );
  assert.equal(
    operationalDates.safeParse({ from: "9999-01-01", to: "9999-01-02" })
      .success,
    false,
  );
});
