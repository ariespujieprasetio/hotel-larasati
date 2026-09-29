"use client";

import { Button } from "@/components/ui/button";

export default function AuditError({ reset }: { reset: () => void }) {
  return (
    <section role="alert" className="space-y-4">
      <h1 className="text-xl font-semibold">Audit logs are unavailable</h1>
      <p>Check your management role, connection, and audit log migration.</p>
      <Button onClick={reset}>Try again</Button>
    </section>
  );
}
