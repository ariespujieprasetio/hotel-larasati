"use client";
// localized-ui
import {
  T,
  LocalizedTextarea,
  LocalizedInput,
} from "@/components/i18n/language-provider";

import { useState, useTransition } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import { updateHousekeeping } from "@/app/(dashboard)/housekeeping/actions";
import { housekeepingNext } from "@/lib/housekeeping";
import type { HousekeepingTask } from "@/types/housekeeping";
import type { Role } from "@/types/database";
import { Button } from "@/components/ui/button";
export function HousekeepingForm({
  task,
  role,
  userId,
  staff,
}: {
  task: HousekeepingTask;
  role: Role;
  userId: string;
  staff: { id: string; full_name: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const management = ["OWNER", "MANAGER"].includes(role);
  const mine = task.assigned_to === userId;
  if (task.closed_at || role === "FRONT_OFFICE")
    return (
      <p className="text-sm text-muted-foreground">
        <T>
          {task.closed_at
            ? "This job is closed. Its history is retained."
            : "Front office can review housekeeping progress."}
        </T>
      </p>
    );
  if (!management && task.assigned_to && !mine)
    return (
      <p className="text-sm text-muted-foreground">
        <T>{"Assigned to "}</T>
        {task.assignee_name}
        <T>{". Management can reassign this task."}</T>
      </p>
    );
  function submit(
    action: "ASSIGN" | "NOTE" | "ADVANCE",
    note = "",
    assignee: string | null = null,
  ) {
    setError("");
    setSuccess("");
    startTransition(async () => {
      try {
        const result = await updateHousekeeping({
          id: task.id,
          version: task.version,
          action,
          note,
          assignee,
        });
        if ("error" in result) setError(result.error);
        else {
          setSuccess("Task updated.");
          router.refresh();
        }
      } catch (e) {
        unstable_rethrow(e);
        setError("Unable to save. Reload to check the latest task.");
      }
    });
  }
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        <T>{"Manage cleaning"}</T>
      </h2>
      {management ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            submit("ASSIGN", "", String(data.get("assignee")) || null);
          }}
        >
          <label className="block text-sm">
            <T>{"Assigned staff"}</T>
            <select
              name="assignee"
              defaultValue={task.assigned_to ?? ""}
              disabled={pending}
              className="mt-1 h-10 w-full rounded-md border px-3"
            >
              <option value="">
                <T>{"Unassigned"}</T>
              </option>
              {task.assigned_to &&
                !staff.some((s) => s.id === task.assigned_to) && (
                  <option value={task.assigned_to}>
                    <T>{"Current assignee unavailable - reassign"}</T>
                  </option>
                )}
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>
          </label>
          {!staff.length && (
            <p className="text-sm text-muted-foreground">
              <T>
                {
                  "No active housekeeping accounts. Management can still progress the task."
                }
              </T>
            </p>
          )}
          <Button variant="outline" disabled={pending}>
            <T>{"Save assignment"}</T>
          </Button>
        </form>
      ) : (
        !mine && (
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => submit("ASSIGN", "", userId)}
          >
            <T>{"Take this task"}</T>
          </Button>
        )
      )}
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit("ADVANCE", String(new FormData(e.currentTarget).get("note")));
        }}
      >
        <label className="block text-sm">
          <T>{"Cleaning or inspection note (optional)"}</T>
          <LocalizedTextarea
            name="note"
            maxLength={2000}
            disabled={pending}
            className="mt-1 w-full rounded-md border p-3"
          />
        </label>
        <p className="text-sm text-muted-foreground">
          <T>
            {!management && !mine
              ? "Progressing will assign this task to you. "
              : ""}
          </T>
          <T>
            {"Confirm the work is complete before advancing the room status."}
          </T>
        </p>
        <label className="flex gap-2 text-sm">
          <LocalizedInput type="checkbox" required disabled={pending} />
          <T>{"I verified the room is ready for this step."}</T>
        </label>
        <Button disabled={pending}>
          <T>{pending ? "Saving..." : housekeepingNext[task.status]}</T>
        </Button>
      </form>
      {(management || mine) && (
        <form
          className="space-y-3 border-t pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit("NOTE", String(new FormData(e.currentTarget).get("note")));
          }}
        >
          <label className="block text-sm">
            <T>{"Add a note without changing status"}</T>
            <LocalizedTextarea
              name="note"
              required
              maxLength={2000}
              disabled={pending}
              className="mt-1 w-full rounded-md border p-3"
            />
          </label>
          <Button variant="outline" disabled={pending}>
            <T>{"Save note"}</T>
          </Button>
        </form>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          <T>{error}</T>
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-emerald-800">
          {success}
        </p>
      )}
    </div>
  );
}
