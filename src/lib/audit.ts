import { z } from "zod";
import { defaultReportDates, reportDates } from "@/lib/payment-reports";

export const auditModules = [
  "all",
  "rooms",
  "guests",
  "reservations",
  "billing",
  "housekeeping",
  "staff",
  "maintenance",
  "expenses",
  "settings",
] as const;

export type AuditEntry = {
  module: string;
  event_id: string;
  entity_id: string;
  actor_id: string | null;
  actor_name: string | null;
  action: string;
  details: string;
  created_at: string;
};

export type AuditResult = { total: number; entries: AuditEntry[] };

export function parseAuditSearch(
  input: Record<string, string | string[] | undefined>,
) {
  const defaults = defaultReportDates();
  const value = (key: string) =>
    typeof input[key] === "string" ? input[key] : undefined;
  const dates = reportDates.safeParse({
    from: value("from") ?? defaults.from,
    to: value("to") ?? defaults.to,
  });
  const selectedModule = auditModules.includes(
    value("module") as (typeof auditModules)[number],
  )
    ? (value("module") as (typeof auditModules)[number])
    : "all";
  const actor = z.uuid().safeParse(value("actor"));
  const rawPage = Number(value("page"));
  return {
    from: dates.success ? dates.data.from : defaults.from,
    to: dates.success ? dates.data.to : defaults.to,
    datesValid: dates.success,
    module: selectedModule,
    actor: actor.success ? actor.data : "",
    page:
      Number.isInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 10000) : 1,
  };
}
