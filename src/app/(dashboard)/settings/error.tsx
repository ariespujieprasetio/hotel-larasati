"use client";
import { Button } from "@/components/ui/button";
export default function SettingsError({ reset }: { reset: () => void }) {
  return (
    <section role="alert" className="space-y-4">
      <h1>Hotel settings could not be loaded</h1>
      <p>Check your connection and apply the hotel settings migration.</p>
      <Button onClick={reset}>Try again</Button>
    </section>
  );
}
