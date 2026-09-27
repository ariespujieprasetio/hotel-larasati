"use client";
import { Button } from "@/components/ui/button";
export default function StayError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section role="alert" className="space-y-4 rounded-xl border bg-card p-6">
      <h1 className="text-xl font-semibold">Billing data is unavailable</h1>
      <p>
        Check your connection and role. If the module was just installed, ask
        your administrator to apply the billing and checkout migration.
      </p>
      <Button onClick={reset}>Try again</Button>
    </section>
  );
}
