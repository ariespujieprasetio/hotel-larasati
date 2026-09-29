"use client";
// localized-ui
import { T } from "@/components/i18n/language-provider";

import { Button } from "@/components/ui/button";
export function PrintButton() {
  return (
    <Button onClick={() => window.print()}>
      <T>{"Print / Save PDF"}</T>
    </Button>
  );
}
