"use client";
// localized-ui
import { T } from "@/components/i18n/language-provider";

import { Button } from "@/components/ui/button";
export default function ReportError({ reset }: { reset: () => void }) {
  return (
    <section role="alert">
      <h1>
        <T>{"Report unavailable"}</T>
      </h1>
      <p>
        <T>
          {"Check your connection and apply the operational reports migration."}
        </T>
      </p>
      <Button onClick={reset}>
        <T>{"Try again"}</T>
      </Button>
    </section>
  );
}
