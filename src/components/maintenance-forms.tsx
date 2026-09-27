"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import {
  createMaintenance,
  updateMaintenance,
} from "@/app/(dashboard)/maintenance/actions";
import { Button } from "@/components/ui/button";
export function MaintenanceReport() {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const request = useRef<{ key: string; id: string } | null>(null);
  const router = useRouter();
  return (
    <form
      className="space-y-3 rounded-xl border p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const v = Object.fromEntries(new FormData(e.currentTarget));
        const key = JSON.stringify(v);
        if (request.current?.key !== key)
          request.current = { key, id: crypto.randomUUID() };
        const requestId = request.current.id;
        setError("");
        start(async () => {
          try {
            const r = await createMaintenance({ ...v, requestId });
            if ("error" in r) setError(r.error);
            else router.push("/maintenance/" + r.id);
          } catch (e) {
            unstable_rethrow(e);
            setError(
              "Connection interrupted. Check the task list before creating another report.",
            );
          }
        });
      }}
    >
      <h2 className="text-xl font-semibold">Report room issue</h2>
      <fieldset disabled={pending} className="grid gap-3 sm:grid-cols-2">
        {[
          { name: "room", label: "Room number", max: 12, min: 1 },
          { name: "title", label: "Issue title", max: 150, min: 3 },
        ].map((f) => (
          <label key={f.name} className="text-sm">
            {f.label}
            <input
              name={f.name}
              required
              minLength={f.min}
              maxLength={f.max}
              className="mt-1 block h-10 w-full rounded border px-3"
            />
          </label>
        ))}
        <label className="text-sm">
          Priority
          <select
            name="priority"
            defaultValue="NORMAL"
            className="mt-1 block h-10 w-full rounded border px-3"
          >
            {["LOW", "NORMAL", "HIGH", "URGENT"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          Description
          <textarea
            name="description"
            required
            minLength={3}
            maxLength={2000}
            className="mt-1 block w-full rounded border p-3"
          />
        </label>
        <Button disabled={pending}>
          {pending ? "Saving..." : "Create report"}
        </Button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
export function MaintenanceUpdate({
  id,
  version,
  status,
  assignedTo,
  staff,
  management,
}: {
  id: string;
  version: number;
  status: string;
  assignedTo: string | null;
  staff: { id: string; full_name: string }[];
  management: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  const actions = [
    ...(management ? ["ASSIGN"] : []),
    ...(status === "OPEN" ? ["START"] : []),
    "NOTE",
    ...(management && status === "IN_PROGRESS" ? ["COMPLETE"] : []),
    ...(management ? ["CANCEL"] : []),
  ];
  return (
    <form
      className="space-y-3 rounded-xl border p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(e.currentTarget));
        setError("");
        start(async () => {
          try {
            const r = await updateMaintenance({
              ...d,
              assignee: d.assignee ?? "",
              id,
              version,
            });
            if ("error" in r) setError(r.error);
            else router.refresh();
          } catch (e) {
            unstable_rethrow(e);
            setError("Connection interrupted. Reload and check history.");
          }
        });
      }}
    >
      <fieldset disabled={pending} className="space-y-3">
        <label className="block">
          Action
          <select name="action" className="ml-3 rounded border p-2">
            {actions.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
        {management && (
          <label className="block">
            Assignee (ASSIGN action only)
            <select
              name="assignee"
              defaultValue={assignedTo ?? ""}
              className="ml-3 rounded border p-2"
            >
              <option value="">Unassigned</option>
              {assignedTo && !staff.some((s) => s.id === assignedTo) && (
                <option value={assignedTo}>
                  Inactive assignee - select another
                </option>
              )}
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block">
          Note / resolution (required for NOTE, COMPLETE and CANCEL)
          <textarea
            name="note"
            maxLength={1800}
            className="mt-1 block w-full rounded border p-3"
          />
        </label>
        <Button disabled={pending}>
          {pending ? "Saving..." : "Update task"}
        </Button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
