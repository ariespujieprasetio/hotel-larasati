"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { T } from "@/components/i18n/language-provider";
import { moveRoom } from "@/app/(dashboard)/in-house/actions";

export function RoomMoveForm({
  reservationId,
  version,
  rooms,
}: {
  reservationId: string;
  version: number;
  rooms: { id: string; room_number: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!rooms.length) return null;
  return (
    <div className="mt-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
      >
        <T>{open ? "Close" : "Move room"}</T>
      </Button>
      {open && (
        <form
          className="mt-3 grid gap-2 rounded-lg border bg-secondary/30 p-3 sm:grid-cols-[1fr_1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setError("");
            start(async () => {
              const result = await moveRoom({
                reservationId,
                version,
                roomId: String(data.get("room_id")),
                reason: String(data.get("reason")),
              });
              if ("error" in result)
                setError(
                  result.error ??
                    "Unable to move the guest. Reload and try again.",
                );
              else {
                router.refresh();
                setOpen(false);
              }
            });
          }}
        >
          <label className="text-xs">
            <T>{"New room"}</T>
            <select
              required
              name="room_id"
              className="mt-1 block h-10 w-full rounded border bg-card px-2 text-sm"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.room_number}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            <T>{"Reason"}</T>
            <input
              required
              minLength={3}
              name="reason"
              className="mt-1 block h-10 w-full rounded border bg-card px-2 text-sm"
              placeholder="Guest request"
            />
          </label>
          <Button className="self-end" disabled={pending}>
            <T>{pending ? "Moving..." : "Confirm move"}</T>
          </Button>
          {error && (
            <p role="alert" className="text-xs text-destructive sm:col-span-3">
              <T>{error}</T>
            </p>
          )}
        </form>
      )}
    </div>
  );
}
