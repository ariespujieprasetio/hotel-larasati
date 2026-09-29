"use client";
// localized-ui
import { T, LocalizedInput } from "@/components/i18n/language-provider";

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
      <h2 className="text-lg font-semibold">
        <T>{"Guest arrival"}</T>
      </h2>
      <p className="text-sm text-muted-foreground">
        <T>{"Confirm the guest has arrived and room "}</T>
        {roomNumber}
        <T>
          {
            " is ready. Check-in records the arrival time and marks the room occupied."
          }
        </T>
      </p>
      <label className="flex items-start gap-2 text-sm">
        <LocalizedInput
          type="checkbox"
          required
          disabled={pending}
          className="mt-1"
        />
        <T> </T>
        <T>{"Guest details and room assignment have been verified."}</T>
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          <T>{error}</T>
        </p>
      )}
      <Button disabled={pending}>
        <T>{pending ? "Checking in..." : "Check in guest"}</T>
      </Button>
    </form>
  );
}
