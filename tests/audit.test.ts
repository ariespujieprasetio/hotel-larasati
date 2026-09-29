import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAuditSearch } from "../src/lib/audit";

test("audit filters allowlist modules, actors, dates and pages", () => {
  const actor = "c0000000-0000-4000-8000-000000000001";
  const parsed = parseAuditSearch({
    from: "2026-09-01",
    to: "2026-09-29",
    module: "expenses",
    actor,
    page: "2",
  });
  assert.deepEqual(
    {
      from: parsed.from,
      to: parsed.to,
      module: parsed.module,
      actor: parsed.actor,
      page: parsed.page,
    },
    {
      from: "2026-09-01",
      to: "2026-09-29",
      module: "expenses",
      actor,
      page: 2,
    },
  );
  assert.equal(parseAuditSearch({ module: "payments" }).module, "all");
  assert.equal(parseAuditSearch({ actor: "bad", page: "-1" }).actor, "");
  assert.equal(parseAuditSearch({ actor: "bad", page: "-1" }).page, 1);
  assert.equal(
    parseAuditSearch({ from: "2026-09-30", to: "2026-09-01" }).datesValid,
    false,
  );
});
