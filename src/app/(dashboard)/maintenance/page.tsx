import Link from "next/link";
import { requireRole } from "@/lib/services/auth";
import { roomReadRoles } from "@/lib/rooms";
import { billingPage, billingDate } from "@/lib/billing";
import { MaintenanceReport } from "@/components/maintenance-forms";
export const metadata = { title: "Maintenance" };
export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const { supabase } = await requireRole(roomReadRoles);
  const q = await searchParams;
  const page = billingPage(q.page);
  const status = [
    "OPEN",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "all",
  ].includes(q.status ?? "")
    ? q.status!
    : "active";
  let query = supabase
    .from("maintenance_tasks")
    .select("*", { count: "exact" });
  if (status === "active") query = query.is("closed_at", null);
  else if (status !== "all") query = query.eq("status", status);
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .order("id")
    .range((page - 1) * 20, page * 20 - 1);
  if (error)
    throw new Error("Maintenance could not be loaded. Apply the migration.");
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Maintenance</h1>
      <p>
        Report and track repairs. Reports do not change room availability.
        Management blocks or releases rooms separately in Rooms after reviewing
        reservations and readiness.
      </p>
      <MaintenanceReport />
      <form className="flex gap-3">
        <select
          name="status"
          defaultValue={status}
          className="rounded border p-2"
        >
          {[
            "active",
            "all",
            "OPEN",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="rounded border px-4">Filter</button>
      </form>
      <div className="divide-y rounded-xl border">
        {!data?.length && (
          <p className="p-5">No maintenance tasks match this filter.</p>
        )}
        {data?.map((t) => (
          <Link
            key={t.id}
            href={"/maintenance/" + t.id}
            className="block space-y-2 p-5"
          >
            <strong>{t.title}</strong>
            <p>
              {t.priority} &middot; {t.status.replaceAll("_", " ")} &middot;{" "}
              {billingDate(t.created_at)} WIB
            </p>
          </Link>
        ))}
      </div>
      <nav className="flex gap-4">
        {page > 1 && (
          <Link href={"?status=" + status + "&page=" + (page - 1)}>
            Previous
          </Link>
        )}
        {page * 20 < (count ?? 0) && (
          <Link href={"?status=" + status + "&page=" + (page + 1)}>Next</Link>
        )}
      </nav>
    </div>
  );
}
