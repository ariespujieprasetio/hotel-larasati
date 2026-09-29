"use client";
// localized-ui
import { T, LocalizedTextarea } from "@/components/i18n/language-provider";

import { useState } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import { updateReservationStatus } from "@/app/(dashboard)/reservations/actions";
import { jakartaDate } from "@/lib/guests";
import type { Reservation } from "@/types/reservations";
import { Button } from "@/components/ui/button";
export function ReservationStatusForm({
  reservation,
}: {
  reservation: Reservation;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  if (!["PENDING", "CONFIRMED"].includes(reservation.status)) return null;
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const values = new FormData(e.currentTarget);
        const status = values.get("status");
        if (
          !window.confirm(
            "Change reservation " +
              reservation.reservation_number +
              " to " +
              String(status) +
              "?",
          )
        )
          return;
        setPending(true);
        setError("");
        try {
          const result = await updateReservationStatus({
            id: reservation.id,
            version: reservation.version,
            status,
            reason: values.get("reason"),
          });
          if ("error" in result) setError(result.error);
          else {
            router.replace("/reservations/" + reservation.id + "?saved=1");
            router.refresh();
          }
        } catch (e) {
          unstable_rethrow(e);
          setError("Unable to update status. Please try again.");
        } finally {
          setPending(false);
        }
      }}
    >
      <h2 className="text-lg font-semibold">
        <T>{"Update booking status"}</T>
      </h2>
      <label className="block text-sm">
        <T>{"New status"}</T>
        <select
          name="status"
          className="mt-1 h-10 w-full rounded-md border px-3"
        >
          {reservation.status === "PENDING" && (
            <option value="CONFIRMED">
              <T>{"Confirmed"}</T>
            </option>
          )}
          <option value="CANCELLED">
            <T>{"Cancelled"}</T>
          </option>
          {reservation.check_in_date <= jakartaDate() && (
            <option value="NO_SHOW">
              <T>{"No-show"}</T>
            </option>
          )}
        </select>
      </label>
      <label className="block text-sm">
        <T>{"Reason (required for cancellation/no-show)"}</T>
        <LocalizedTextarea
          name="reason"
          rows={3}
          maxLength={500}
          className="mt-1 w-full rounded-md border p-3"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          <T>{error}</T>
        </p>
      )}
      <Button disabled={pending}>
        <T>{pending ? "Updating…" : "Update status"}</T>
      </Button>
    </form>
  );
}
