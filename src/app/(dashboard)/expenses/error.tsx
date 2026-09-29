"use client";
import { Button } from "@/components/ui/button";
export default function ExpenseError({ reset }: { reset: () => void }) {
  return (
    <section role="alert">
      <h1>Expenses could not be loaded</h1>
      <p>Check your connection and apply the expenses migration.</p>
      <Button onClick={reset}>Try again</Button>
    </section>
  );
}
