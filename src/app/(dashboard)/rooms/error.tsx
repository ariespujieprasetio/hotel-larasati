"use client";
import { Button } from "@/components/ui/button";
export default function RoomsError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div role="alert" className="space-y-4 rounded-xl border bg-card p-6">
      <h1 className="text-xl font-semibold">Room data is unavailable</h1>
      <p>
        Check your role and connection. If this module was just installed, ask
        your administrator to apply the room-management migration.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
