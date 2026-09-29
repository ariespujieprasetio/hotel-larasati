"use client";
// localized-ui
import { T, LocalizedInput } from "@/components/i18n/language-provider";

import { useRef, useState, useTransition } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import { addExtra, voidExtra } from "@/app/(dashboard)/folios/actions";
import { Button } from "@/components/ui/button";
export function ExtraForm({
  folioId,
  version,
  currency,
}: {
  folioId: string;
  version: number;
  currency: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const request = useRef<{ fingerprint: string; id: string } | null>(null);
  const router = useRouter();
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const d = new FormData(form);
        const values = {
          folioId,
          description: String(d.get("description")),
          quantity: Number(d.get("quantity")),
          unitPrice: String(d.get("unitPrice")),
        };
        const fingerprint = JSON.stringify(values);
        if (request.current?.fingerprint !== fingerprint)
          request.current = { fingerprint, id: crypto.randomUUID() };
        const requestId = request.current.id;
        setError("");
        setSuccess(false);
        start(async () => {
          try {
            const result = await addExtra({ ...values, version, requestId });
            if ("error" in result) setError(result.error);
            else {
              request.current = null;
              form.reset();
              setSuccess(true);
              router.refresh();
            }
          } catch (e) {
            unstable_rethrow(e);
            setError(
              "Connection interrupted. Retry with the same details or check history first.",
            );
          }
        });
      }}
    >
      <h2 className="text-xl font-semibold">
        <T>{"Add extra charge"}</T>
      </h2>
      <p className="text-sm text-muted-foreground">
        <T>{"Use the final unit price in "}</T>
        {currency}
        <T>
          {
            ", including any applicable tax or service. No additional percentages are applied."
          }
        </T>
      </p>
      <fieldset disabled={pending} className="space-y-3">
        <label className="block text-sm">
          <T>{"Service or item"}</T>
          <LocalizedInput
            name="description"
            required
            minLength={2}
            maxLength={200}
            placeholder="Laundry, minibar, extra bed..."
            className="mt-1 h-10 w-full rounded-md border px-3"
          />
        </label>
        <label className="block text-sm">
          <T>{"Quantity"}</T>
          <LocalizedInput
            name="quantity"
            type="number"
            required
            min={1}
            max={1000}
            step={1}
            defaultValue={1}
            className="mt-1 h-10 w-full rounded-md border px-3"
          />
        </label>
        <label className="block text-sm">
          <T>{"Final unit price ("}</T>
          {currency})
          <LocalizedInput
            name="unitPrice"
            type="number"
            required
            min="0.01"
            max="999999999999.99"
            step="0.01"
            className="mt-1 h-10 w-full rounded-md border px-3"
          />
        </label>
        <label className="flex gap-2 text-sm">
          <LocalizedInput type="checkbox" required />
          <T>
            {
              "I verified this charge and checked it has not already been recorded."
            }
          </T>
        </label>
        <Button disabled={pending}>
          <T>{pending ? "Saving..." : "Add charge"}</T>
        </Button>
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          <T>{error}</T>
        </p>
      )}
      {success && (
        <p role="status" className="text-sm">
          <T>{"Charge added."}</T>
        </p>
      )}
    </form>
  );
}
export function VoidExtraForm({
  extraId,
  version,
}: {
  extraId: string;
  version: number;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const reason = String(new FormData(e.currentTarget).get("reason"));
        setError("");
        start(async () => {
          try {
            const r = await voidExtra({ extraId, version, reason });
            if ("error" in r) setError(r.error);
            else router.refresh();
          } catch (e) {
            unstable_rethrow(e);
            setError(
              "Unable to confirm cancellation. Reload and review history.",
            );
          }
        });
      }}
    >
      <label className="text-sm">
        <T>{"Cancellation reason"}</T>
        <LocalizedInput
          name="reason"
          required
          minLength={3}
          maxLength={500}
          disabled={pending}
          className="mt-1 block h-10 rounded-md border px-3"
        />
      </label>
      <Button variant="outline" disabled={pending}>
        <T>{pending ? "Cancelling..." : "Cancel charge"}</T>
      </Button>
      {error && (
        <p role="alert" className="w-full text-sm text-destructive">
          <T>{error}</T>
        </p>
      )}
    </form>
  );
}
