"use client";
// localized-ui
import { T } from "@/components/i18n/language-provider";

import { Button } from "@/components/ui/button";
export default function GuestError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section role="alert" className="space-y-4 rounded-xl border bg-card p-6">
      <h1 className="text-xl font-semibold">
        <T>{"Guest data is unavailable"}</T>
      </h1>
      <p>
        <T>
          {
            "Check your connection and access. If the guest module was just installed, ask your administrator to apply its migration."
          }
        </T>
      </p>
      <Button onClick={reset}>
        <T>{"Try again"}</T>
      </Button>
    </section>
  );
}
