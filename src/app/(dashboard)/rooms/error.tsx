"use client";
// localized-ui
import { T } from "@/components/i18n/language-provider";

import { Button } from "@/components/ui/button";
export default function RoomsError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div role="alert" className="space-y-4 rounded-xl border bg-card p-6">
      <h1 className="text-xl font-semibold">
        <T>{"Room data is unavailable"}</T>
      </h1>
      <p>
        <T>
          {
            "Check your role and connection. If this module was just installed, ask your administrator to apply the room-management migration."
          }
        </T>
      </p>
      <Button onClick={reset}>
        <T>{"Try again"}</T>
      </Button>
    </div>
  );
}
