"use client";
// localized-ui
import {
  T,
  LocalizedInput,
  LocalizedTextarea,
} from "@/components/i18n/language-provider";

import { useRef, useState, useTransition } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import { recordExpense, voidExpense } from "@/app/(dashboard)/expenses/actions";
import { expenseCategories } from "@/lib/expenses";
import { Button } from "@/components/ui/button";
export function ExpenseForm({
  today,
  currency,
}: {
  today: string;
  currency: string;
}) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  const request = useRef<{ key: string; id: string } | null>(null);
  const router = useRouter();
  return (
    <form
      className="space-y-4 rounded-xl border p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const v = Object.fromEntries(new FormData(form));
        const key = JSON.stringify(v);
        if (request.current?.key !== key)
          request.current = { key, id: crypto.randomUUID() };
        const id = request.current.id;
        setMessage("");
        start(async () => {
          try {
            const r = await recordExpense({ ...v, id });
            if ("error" in r) setMessage(r.error);
            else {
              request.current = null;
              form.reset();
              setMessage(
                "Expense recorded. Adjust the date filter if it is outside the displayed period.",
              );
              router.refresh();
            }
          } catch (e) {
            unstable_rethrow(e);
            setMessage(
              "Connection interrupted. Retry the same details or check history first.",
            );
          }
        });
      }}
    >
      <h2 className="text-xl font-semibold">
        <T>{"Record paid expense"}</T>
      </h2>
      <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
        <label>
          <T>{"Payment date"}</T>
          <LocalizedInput
            name="paid_on"
            type="date"
            min="1900-01-01"
            max={today}
            defaultValue={today}
            required
            className="mt-1 block w-full rounded border p-2"
          />
        </label>
        <label>
          <T>{"Category"}</T>
          <select
            name="category"
            className="mt-1 block w-full rounded border p-2"
          >
            {expenseCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          <T>{"Amount"}</T>
          <LocalizedInput
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            max="999999999999.99"
            required
            className="mt-1 block w-full rounded border p-2"
          />
        </label>
        <label>
          <T>{"Currency"}</T>
          <LocalizedInput
            name="currency"
            defaultValue={currency}
            pattern="[A-Za-z]{3}"
            maxLength={3}
            required
            className="mt-1 block w-full rounded border p-2"
          />
        </label>
        <label>
          <T>{"Method"}</T>
          <select
            name="method"
            className="mt-1 block w-full rounded border p-2"
          >
            {["CASH", "BANK_TRANSFER", "CARD", "QRIS"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          <T>{"Reference (required for non-cash)"}</T>
          <LocalizedInput
            name="reference"
            maxLength={150}
            className="mt-1 block w-full rounded border p-2"
          />
        </label>
        <label className="sm:col-span-2">
          <T>{"Description"}</T>
          <LocalizedTextarea
            name="description"
            required
            minLength={3}
            maxLength={1000}
            className="mt-1 block w-full rounded border p-2"
          />
        </label>
        <label className="sm:col-span-2">
          <LocalizedInput type="checkbox" required />
          <T>
            {
              " I verified this money was paid and has not already been recorded."
            }
          </T>
        </label>
        <Button disabled={pending}>
          <T>{pending ? "Saving..." : "Record expense"}</T>
        </Button>
      </fieldset>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
export function VoidExpenseForm({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const reason = String(new FormData(e.currentTarget).get("reason"));
        start(async () => {
          try {
            const r = await voidExpense({ id, reason });
            if ("error" in r) setError(r.error);
            else router.refresh();
          } catch (e) {
            unstable_rethrow(e);
            setError("Reload to check cancellation status.");
          }
        });
      }}
    >
      <label>
        <T>{"Reason for correcting this record"}</T>
        <LocalizedInput
          name="reason"
          minLength={3}
          maxLength={500}
          required
          disabled={pending}
          className="mt-1 block rounded border p-2"
        />
      </label>
      <Button variant="outline" disabled={pending}>
        <T>{"Cancel incorrect expense"}</T>
      </Button>
      {error && (
        <p role="alert">
          <T>{error}</T>
        </p>
      )}
    </form>
  );
}
