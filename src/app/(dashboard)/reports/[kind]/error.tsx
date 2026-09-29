"use client";
import { Button } from "@/components/ui/button";
export default function ReportError({ reset }: { reset: () => void }) {
  return (
    <section role="alert">
      <h1>Report unavailable</h1>
      <p>Check your connection and apply the operational reports migration.</p>
      <Button onClick={reset}>Try again</Button>
    </section>
  );
}
