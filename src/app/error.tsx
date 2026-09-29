"use client";
// localized-ui
import { T } from "@/components/i18n/language-provider";

import { Button } from "@/components/ui/button";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="text-2xl font-semibold">
        <T>{"We couldn’t load this page"}</T>
      </h1>
      <p className="my-4 text-muted-foreground">
        <T>
          {
            "Please try again. If the problem continues, ask your administrator to check the connection and database setup."
          }
        </T>
      </p>
      <Button onClick={reset}>
        <T>{"Try again"}</T>
      </Button>
    </main>
  );
}
