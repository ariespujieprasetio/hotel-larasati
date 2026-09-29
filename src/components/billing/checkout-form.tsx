"use client";
// localized-ui
import { T, LocalizedInput } from "@/components/i18n/language-provider";

import { useState, useTransition } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import { checkOut } from "@/app/(dashboard)/folios/actions";
import { Button } from "@/components/ui/button";
export function CheckoutForm({
  folioId,
  version,
  balance,
}: {
  folioId: string;
  version: number;
  balance: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        startTransition(async () => {
          try {
            const result = await checkOut({ folioId, version });
            if ("error" in result) setError(result.error);
            else {
              router.replace("/folios/" + folioId + "?checkedOut=1");
              router.refresh();
            }
          } catch (e) {
            unstable_rethrow(e);
            setError("Unable to confirm check-out. Reload the bill.");
          }
        });
      }}
    >
      <h2 className="text-xl font-semibold">
        <T>{"Check-out"}</T>
      </h2>
      <p className="text-sm text-muted-foreground">
        <T>
          {
            "Check-out closes this bill and marks the room DIRTY. Add all services before settling the balance. Room prices are retained for early or late departure; no automatic late fees or refunds are calculated."
          }
        </T>
      </p>
      {balance > 0 ? (
        <p className="text-sm text-amber-800">
          <T>{"Settle the balance before check-out."}</T>
        </p>
      ) : (
        <label className="flex items-start gap-2 text-sm">
          <LocalizedInput
            type="checkbox"
            required
            disabled={pending}
            className="mt-1"
          />
          <T>
            {"I reviewed the final bill and confirm the guest has departed."}
          </T>
        </label>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          <T>{error}</T>
        </p>
      )}
      <Button disabled={pending || balance !== 0}>
        <T>{pending ? "Checking out..." : "Complete check-out"}</T>
      </Button>
    </form>
  );
}
