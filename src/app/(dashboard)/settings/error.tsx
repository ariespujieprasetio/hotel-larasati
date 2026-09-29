"use client";
// localized-ui
import { T } from "@/components/i18n/language-provider";

import { Button } from "@/components/ui/button";
export default function SettingsError({ reset }: { reset: () => void }) {
  return (
    <section role="alert" className="space-y-4">
      <h1>
        <T>{"Hotel settings could not be loaded"}</T>
      </h1>
      <p>
        <T>{"Check your connection and apply the hotel settings migration."}</T>
      </p>
      <Button onClick={reset}>
        <T>{"Try again"}</T>
      </Button>
    </section>
  );
}
