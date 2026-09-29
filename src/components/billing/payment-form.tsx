"use client";
// localized-ui
import { T, LocalizedInput } from "@/components/i18n/language-provider";

import { useRef, useState, useTransition } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import { recordPayment } from "@/app/(dashboard)/folios/actions";
import { paymentMethods } from "@/lib/billing";
import { Button } from "@/components/ui/button";
export function PaymentForm({
  folioId,
  currency,
  balance,
}: {
  folioId: string;
  currency: string;
  balance: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const request = useRef<{ fingerprint: string; id: string } | null>(null);
  const router = useRouter();
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        const values = {
          folioId,
          amount: String(data.get("amount")),
          method: String(data.get("method")),
          reference: String(data.get("reference")),
        };
        const fingerprint = JSON.stringify(values);
        if (request.current?.fingerprint !== fingerprint)
          request.current = { fingerprint, id: crypto.randomUUID() };
        const requestId = request.current.id;
        setError("");
        setSuccess(false);
        startTransition(async () => {
          try {
            const result = await recordPayment({ ...values, requestId });
            if ("error" in result) setError(result.error);
            else {
              setSuccess(true);
              request.current = null;
              form.reset();
              router.refresh();
            }
          } catch (e) {
            unstable_rethrow(e);
            setError(
              "Connection interrupted. Retry with the same payment details.",
            );
          }
        });
      }}
    >
      <h2 className="text-xl font-semibold">
        <T>{"Record received payment"}</T>
      </h2>
      <p className="text-sm text-muted-foreground">
        <T>
          {
            "Record money already received. This form does not charge a card or send a bank transfer."
          }
        </T>
      </p>
      <fieldset disabled={pending} className="space-y-3">
        <label className="block text-sm">
          <T>{"Amount ("}</T>
          {currency})
          <LocalizedInput
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            max={balance}
            required
            className="mt-1 h-10 w-full rounded-md border px-3"
          />
        </label>
        <label className="block text-sm">
          <T>{"Method"}</T>
          <select
            name="method"
            className="mt-1 h-10 w-full rounded-md border px-3"
          >
            <T>
              {paymentMethods.map((m) => (
                <option key={m} value={m}>
                  {m.replaceAll("_", " ")}
                </option>
              ))}
            </T>
          </select>
        </label>
        <label className="block text-sm">
          <T>{"Transaction reference (required for non-cash)"}</T>
          <LocalizedInput
            name="reference"
            maxLength={150}
            className="mt-1 h-10 w-full rounded-md border px-3"
          />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <LocalizedInput type="checkbox" required className="mt-1" />
          <T>
            {
              "I verified this payment was received and has not already been recorded."
            }
          </T>
        </label>
        <Button disabled={pending || balance <= 0}>
          <T>{pending ? "Recording..." : "Record payment"}</T>
        </Button>
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          <T>{error}</T>
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-emerald-800">
          <T>{"Payment recorded."}</T>
        </p>
      )}
    </form>
  );
}
