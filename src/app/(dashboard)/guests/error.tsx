"use client";
import { Button } from "@/components/ui/button";
export default function GuestError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section role="alert" className="space-y-4 rounded-xl border bg-card p-6">
      <h1 className="text-xl font-semibold">Guest data is unavailable</h1>
      <p>
        Check your connection and access. If the guest module was just
        installed, ask your administrator to apply its migration.
      </p>
      <Button onClick={reset}>Try again</Button>
    </section>
  );
}
