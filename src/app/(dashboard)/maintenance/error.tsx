"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section role="alert">
      <h1>Maintenance is unavailable</h1>
      <p>Check your role, connection and maintenance migration.</p>
      <Button onClick={reset}>Try again</Button>
    </section>
  );
}
