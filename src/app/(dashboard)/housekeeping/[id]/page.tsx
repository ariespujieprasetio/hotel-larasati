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
        Back to housekeeping
      </Link>
      <header>
        <h1 className="text-3xl font-semibold">Room {task.room_number}</h1>
        <p className="mt-2 text-muted-foreground">
          {task.status} &middot;{" "}
          {task.assigned_to ? task.assignee_name : "Unassigned"}
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="text-xl font-semibold">Room readiness</h2>
          <p>
            Current room status: {room.status.replaceAll("_", " ")}
            {!room.is_active ? " (inactive)" : ""}
          </p>
          <p className="text-sm">Job opened: {time(task.created_at)} WIB</p>
          {task.closed_at && (
            <p className="text-sm">Job closed: {time(task.closed_at)} WIB</p>
          )}
          <Link className="text-sm underline" href={"/rooms/" + task.room_id}>
            View room
          </Link>
          <p className="text-sm text-muted-foreground">
            DIRTY &rarr; CLEANING &rarr; CLEAN &rarr; INSPECTED &rarr;
            AVAILABLE. Changes from the Rooms page are recorded here too.
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
        <h2 className="text-xl font-semibold">Work history</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Latest {Math.min(activityCount, 50)} of {activityCount} events
          &middot; WIB
        </p>
        <ul className="mt-4 divide-y">
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
        </ul>
      </section>
    </div>
  );
}
