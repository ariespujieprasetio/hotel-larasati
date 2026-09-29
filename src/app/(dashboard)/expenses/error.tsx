"use client";
// localized-ui
import { T } from "@/components/i18n/language-provider";

import { Button } from "@/components/ui/button";
export default function ExpenseError({ reset }: { reset: () => void }) {
  return (
    <section role="alert">
      <h1>
        <T>{"Expenses could not be loaded"}</T>
      </h1>
      <p>
        <T>{"Check your connection and apply the expenses migration."}</T>
      </p>
      <Button onClick={reset}>
        <T>{"Try again"}</T>
      </Button>
    </section>
  );
}
