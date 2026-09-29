"use client";
// localized-ui
import { T } from "@/components/i18n/language-provider";

import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section role="alert">
      <h1>
        <T>{"Maintenance is unavailable"}</T>
      </h1>
      <p>
        <T>{"Check your role, connection and maintenance migration."}</T>
      </p>
      <Button onClick={reset}>
        <T>{"Try again"}</T>
      </Button>
    </section>
  );
}
