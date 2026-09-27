"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { checkIn } from "@/app/(dashboard)/check-in/actions";
import { Button } from "@/components/ui/button";
export function CheckInForm({
  id,
  version,
  roomNumber,
}: {
  id: string;
  version: number;
  roomNumber: string;
}) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <form
      className="space-y-3"
      action={() => {
        setError("");
        startTransition(async () => {
          const result = await checkIn({ id, version });
          if ("error" in result) setError(result.error);
          else {
            router.push("/in-house?checkedIn=1");
            router.refresh();
          }
        });
      }}
    >
      <h2 className="text-lg font-semibold">Guest arrival</h2>
      <p className="text-sm text-muted-foreground">
        Confirm the guest has arrived and room {roomNumber} is ready. Check-in
        records the arrival time and marks the room occupied.
      </p>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" required disabled={pending} className="mt-1" />{" "}
        Guest details and room assignment have been verified.
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button disabled={pending}>
        {pending ? "Checking in..." : "Check in guest"}
      </Button>
    </form>
  );
}
