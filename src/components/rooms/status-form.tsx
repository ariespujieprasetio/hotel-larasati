"use client";
import { useState } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import { changeRoomStatus } from "@/app/(dashboard)/rooms/actions";
import { statusOptions, statusLabel } from "@/lib/rooms";
import type { Room } from "@/types/rooms";
import type { Role } from "@/types/database";
import { Button } from "@/components/ui/button";
import { controlClass } from "./form-fields";
export function StatusForm({ room, role }: { room: Room; role: Role }) {
  const options = statusOptions(room.status, role);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  if (!room.is_active || !options.length)
    return (
      <p className="text-sm text-muted-foreground">
        No manual status changes available for this room and role.
      </p>
    );
  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const status = new FormData(form).get("status");
        if (
          !window.confirm(
            "Change room " +
              room.room_number +
              " to " +
              String(status).replaceAll("_", " ") +
              "?",
          )
        )
          return;
        setError("");
        setPending(true);
        try {
          const result = await changeRoomStatus({
            id: room.id,
            version: room.version,
            status,
          });
          if ("error" in result) setError(result.error);
          else {
            router.replace("/rooms/" + room.id + "?saved=1");
            router.refresh();
          }
        } catch (e) {
          unstable_rethrow(e);
          setError("Connection failed. Please try again.");
        } finally {
          setPending(false);
        }
      }}
    >
      <label htmlFor="status" className="text-sm font-medium">
        Change status
      </label>
      <select name="status" id="status" className={controlClass}>
        {options.map((s) => (
          <option key={s} value={s}>
            {statusLabel(s)}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button disabled={pending}>
        {pending ? "Updating…" : "Update status"}
      </Button>
    </form>
  );
}
