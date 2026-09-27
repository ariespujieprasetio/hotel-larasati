"use client";
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
        Reverse incorrect entry
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
          Corrects the recorded bill balance. No money is refunded or
          transferred.
        </p>
        <label className="block text-sm">
          Reason
          <textarea
            name="reason"
            minLength={3}
            maxLength={500}
            required
            disabled={pending}
            className="mt-1 w-full rounded-md border p-3"
          />
        </label>
        <label className="flex gap-2 text-sm">
          <input type="checkbox" required disabled={pending} />I confirm this
          entry was recorded incorrectly.
        </label>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button disabled={pending} variant="outline">
          {pending ? "Reversing..." : "Reverse entry"}
        </Button>
      </form>
    </details>
  );
}
