"use client";
// localized-ui
import { T } from "@/components/i18n/language-provider";

import { Button } from "@/components/ui/button";

export default function AuditError({ reset }: { reset: () => void }) {
  return (
    <section role="alert" className="space-y-4">
      <h1 className="text-xl font-semibold">
        <T>{"Audit logs are unavailable"}</T>
      </h1>
      <p>
        <T>
          {"Check your management role, connection, and audit log migration."}
        </T>
      </p>
      <Button onClick={reset}>
        <T>{"Try again"}</T>
      </Button>
    </section>
  );
}
