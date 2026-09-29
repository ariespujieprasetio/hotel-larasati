// localized-ui
import { T } from "@/components/i18n/language-provider";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/services/auth";
import { roomReadRoles } from "@/lib/rooms";
import { billingDate, billingPage } from "@/lib/billing";
import { MaintenanceUpdate } from "@/components/maintenance-forms";
export default async function MaintenanceDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { supabase, profile } = await requireRole(roomReadRoles);
  const task = await supabase
    .from("maintenance_tasks")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (task.error) throw new Error("Task could not be loaded");
  if (!task.data) notFound();
  const t = task.data;
  const page = billingPage((await searchParams).page);
  const [room, staff, history] = await Promise.all([
    supabase
      .from("rooms")
      .select("room_number,status")
      .eq("id", t.room_id)
      .single(),
    supabase.rpc("maintenance_staff"),
    supabase
      .from("maintenance_activity")
      .select("*", { count: "exact" })
      .eq("task_id", id)
      .order("created_at", { ascending: false })
      .order("id")
      .range((page - 1) * 20, page * 20 - 1),
  ]);
  if (room.error || staff.error || history.error)
    throw new Error("Task details unavailable");
  const management = ["OWNER", "MANAGER"].includes(profile.role);
  return (
    <div className="space-y-5">
      <Link href="/maintenance" className="underline">
        <T>{"Back to maintenance"}</T>
      </Link>
      <h1 className="text-3xl font-semibold">{t.title}</h1>
      <p>
        <T>{"Room "}</T>
        {room.data.room_number} &middot; {t.priority} &middot; <T>{t.status}</T>
      </p>
      <p className="whitespace-pre-wrap break-words">{t.description}</p>
      <p>
        <T>{"Assigned to:"}</T>
        <T> </T>
        {staff.data.find((s) => s.id === t.assigned_to)?.full_name ??
          (t.assigned_to ? "Inactive staff" : "Unassigned")}
      </p>
      <Link className="underline" href={"/rooms/" + t.room_id}>
        <T>{"Review room readiness ("}</T>
        {room.data.status})
      </Link>
      {!t.closed_at &&
        (management ||
          (profile.role === "HOUSEKEEPING" &&
            t.assigned_to === profile.id)) && (
          <MaintenanceUpdate
            key={t.version}
            id={t.id}
            version={t.version}
            status={t.status}
            assignedTo={t.assigned_to}
            staff={staff.data}
            management={management}
          />
        )}
      <h2 className="text-xl font-semibold">
        <T>{"Task history"}</T>
      </h2>
      {history.data.map((e) => (
        <div key={e.id} className="rounded border p-4">
          <strong>{e.action}</strong>
          <p className="whitespace-pre-wrap break-words">{e.note}</p>
          <p className="text-xs">
            {billingDate(e.created_at)}
            <T>{" WIB \u00b7 Staff: "}</T>
            {e.user_id}
          </p>
        </div>
      ))}
      <nav className="flex gap-4">
        {page > 1 && (
          <Link href={"?page=" + (page - 1)}>
            <T>{"Previous history"}</T>
          </Link>
        )}
        {page * 20 < (history.count ?? 0) && (
          <Link href={"?page=" + (page + 1)}>
            <T>{"Next history"}</T>
          </Link>
        )}
      </nav>
    </div>
  );
}
