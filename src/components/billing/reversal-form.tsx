"use client";
// localized-ui
import {
  T,
  LocalizedTextarea,
  LocalizedInput,
} from "@/components/i18n/language-provider";

import { useState, useTransition } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import { reversePayment } from "@/app/(dashboard)/folios/actions";
import { Button } from "@/components/ui/button";
export function ReversalForm({ paymentId }: { paymentId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-sm underline">
        <T>{"Reverse incorrect entry"}</T>
      </summary>
      <form
        className="mt-3 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const reason = new FormData(e.currentTarget).get("reason");
          setError("");
          startTransition(async () => {
            try {
              const result = await reversePayment({ paymentId, reason });
              if ("error" in result) setError(result.error);
              else router.refresh();
            } catch (e) {
              unstable_rethrow(e);
              setError("Unable to reverse payment. Please retry.");
            }
          });
        }}
      >
        <p className="text-sm text-muted-foreground">
          <T>
            {
              "Corrects the recorded bill balance. No money is refunded or transferred."
            }
          </T>
        </p>
        <label className="block text-sm">
          <T>{"Reason"}</T>
          <LocalizedTextarea
            name="reason"
            minLength={3}
            maxLength={500}
            required
            disabled={pending}
            className="mt-1 w-full rounded-md border p-3"
          />
        </label>
        <label className="flex gap-2 text-sm">
          <LocalizedInput type="checkbox" required disabled={pending} />
          <T>{"I confirm this entry was recorded incorrectly."}</T>
        </label>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            <T>{error}</T>
          </p>
        )}
        <Button disabled={pending} variant="outline">
          <T>{pending ? "Reversing..." : "Reverse entry"}</T>
        </Button>
      </form>
    </details>
  );
}
