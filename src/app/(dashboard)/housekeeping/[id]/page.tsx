// localized-ui
import { T } from "@/components/i18n/language-provider";
import Link from "next/link";
import { getHousekeepingTask } from "@/lib/services/housekeeping";
import { HousekeepingForm } from "@/components/housekeeping/task-form";
export const metadata = { title: "Cleaning task" };
function time(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
export default async function HousekeepingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { task, room, activity, activityCount, staff, profile } =
    await getHousekeepingTask((await params).id);
  return (
    <div className="space-y-6">
      <Link href="/housekeeping" className="text-sm underline">
        <T>{"Back to housekeeping"}</T>
      </Link>
      <header>
        <h1 className="text-3xl font-semibold">
          <T>{"Room "}</T>
          {task.room_number}
        </h1>
        <p className="mt-2 text-muted-foreground">
          <T>{task.status}</T> &middot;<T> </T>
          {task.assigned_to ? task.assignee_name : "Unassigned"}
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="text-xl font-semibold">
            <T>{"Room readiness"}</T>
          </h2>
          <p>
            <T>{"Current room status: "}</T>
            <T>{room.status.replaceAll("_", " ")}</T>
            <T>{!room.is_active ? " (inactive)" : ""}</T>
          </p>
          <p className="text-sm">
            <T>{"Job opened: "}</T>
            {time(task.created_at)}
            <T>{" WIB"}</T>
          </p>
          {task.closed_at && (
            <p className="text-sm">
              <T>{"Job closed: "}</T>
              {time(task.closed_at)}
              <T>{" WIB"}</T>
            </p>
          )}
          <Link className="text-sm underline" href={"/rooms/" + task.room_id}>
            <T>{"View room"}</T>
          </Link>
          <p className="text-sm text-muted-foreground">
            <T>
              {
                "DIRTY \u2192 CLEANING \u2192 CLEAN \u2192 INSPECTED \u2192 AVAILABLE. Changes from the Rooms page are recorded here too."
              }
            </T>
          </p>
        </section>
        <section className="rounded-xl border bg-card p-6">
          <HousekeepingForm
            key={task.version}
            task={task}
            role={profile.role}
            userId={profile.id}
            staff={staff}
          />
        </section>
      </div>
      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">
          <T>{"Work history"}</T>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          <T>{"Latest "}</T>
          {Math.min(activityCount, 50)}
          <T>{" of "}</T>
          {activityCount}
          <T>{" events \u00b7 WIB"}</T>
        </p>
        <ul className="mt-4 divide-y">
          <T>
            {activity.map((a) => (
              <li key={a.id} className="space-y-2 py-4">
                <p className="font-medium">
                  {a.action.replaceAll("_", " ")} &middot; {a.status}
                </p>
                <p className="text-sm">
                  {time(a.created_at)}
                  {a.assignee_name ? " | Assigned: " + a.assignee_name : ""}
                </p>
                {a.note && (
                  <p className="whitespace-pre-wrap text-sm">{a.note}</p>
                )}
                <p className="break-all text-xs text-muted-foreground">
                  Staff ID: {a.user_id ?? "System"}
                </p>
              </li>
            ))}
          </T>
        </ul>
      </section>
    </div>
  );
}
