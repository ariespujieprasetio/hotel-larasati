// localized-ui
import { T, LocalizedInput } from "@/components/i18n/language-provider";
import Link from "next/link";
import { auditModules } from "@/lib/audit";
import { getAuditLog } from "@/lib/services/audit";
import { billingDate } from "@/lib/billing";

export const metadata = { title: "Audit logs" };

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const { search, result, staff } = await getAuditLog(query);
  const href = (page: number) =>
    "?" +
    new URLSearchParams({
      from: search.from,
      to: search.to,
      module: search.module,
      ...(search.actor ? { actor: search.actor } : {}),
      page: String(page),
    });
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">
          <T>{"Audit logs"}</T>
        </h1>
        <p className="mt-2 max-w-4xl text-muted-foreground">
          <T>
            {
              "Combined operational history for management review. Sensitive field values, identity numbers, bank references, passwords, and task notes are not displayed here."
            }
          </T>
        </p>
      </header>
      <form className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <T>{"From"}</T>
          <LocalizedInput
            name="from"
            type="date"
            required
            defaultValue={search.from}
            className="mt-1 block rounded border p-2"
          />
        </label>
        <label className="text-sm">
          <T>{"Through"}</T>
          <LocalizedInput
            name="to"
            type="date"
            required
            defaultValue={search.to}
            className="mt-1 block rounded border p-2"
          />
        </label>
        <label className="text-sm">
          <T>{"Module"}</T>
          <select
            name="module"
            defaultValue={search.module}
            className="mt-1 block rounded border p-2"
          >
            <T>
              {auditModules.map((module) => (
                <option key={module} value={module}>
                  {module.replaceAll("_", " ").toUpperCase()}
                </option>
              ))}
            </T>
          </select>
        </label>
        <label className="text-sm">
          <T>{"Staff"}</T>
          <select
            name="actor"
            defaultValue={search.actor}
            className="mt-1 block max-w-72 rounded border p-2"
          >
            <option value="">
              <T>{"All staff"}</T>
            </option>
            {staff.map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name} ({person.email})
                <T>{person.is_active ? "" : " - inactive"}</T>
              </option>
            ))}
          </select>
        </label>
        <button className="rounded bg-primary px-4 py-2 text-primary-foreground">
          <T>{"Filter"}</T>
        </button>
      </form>
      {!search.datesValid && (
        <p role="alert">
          <T>{"Invalid dates were replaced with the current month."}</T>
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        {result.total}
        <T>{" matching events \u00b7 page "}</T>
        {search.page}
      </p>
      <div className="divide-y rounded-xl border bg-card">
        {!result.entries.length && (
          <p className="p-5">
            <T>{"No audit events match this filter."}</T>
          </p>
        )}
        <T>
          {result.entries.map((entry) => (
            <article
              key={entry.module + entry.event_id + entry.action}
              className="space-y-2 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold">
                  {entry.module.toUpperCase()} &middot;{" "}
                  {entry.action.replaceAll("_", " ")}
                </h2>
                <time className="text-sm text-muted-foreground">
                  {billingDate(entry.created_at)} WIB
                </time>
              </div>
              <p className="break-words text-sm">
                {entry.details || "No additional metadata"}
              </p>
              <p className="break-all text-xs text-muted-foreground">
                Actor: {entry.actor_name ?? "System or deleted staff"}
                {entry.actor_id ? " (" + entry.actor_id + ")" : ""} &middot;
                Entity: {entry.entity_id}
              </p>
            </article>
          ))}
        </T>
      </div>
      <nav
        aria-label="Audit log pages"
        className="flex gap-4 text-sm underline"
      >
        {search.page > 1 && (
          <Link href={href(search.page - 1)}>
            <T>{"Previous"}</T>
          </Link>
        )}
        {search.page * 50 < result.total && (
          <Link href={href(search.page + 1)}>
            <T>{"Next"}</T>
          </Link>
        )}
      </nav>
      <p className="text-xs text-muted-foreground">
        <T>
          {
            "This page combines business-operation audit records. Authentication sign-in/sign-out events and Supabase platform administration are not recorded by this application log."
          }
        </T>
      </p>
    </div>
  );
}
