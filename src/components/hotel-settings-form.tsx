"use client";
import { useState, useTransition } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import type { HotelSettings } from "@/types/database";
import { saveHotelSettings } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
export function HotelSettingsForm({
  settings: s,
}: {
  settings: HotelSettings;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const fields = [
    {
      name: "hotel_name",
      label: "Hotel name",
      value: s.hotel_name,
      max: 150,
      required: true,
    },
    { name: "phone", label: "Phone", value: s.phone ?? "", max: 40 },
    {
      name: "email",
      label: "Email",
      value: s.email ?? "",
      max: 254,
      type: "email",
    },
    {
      name: "check_in_time",
      label: "Check-in time (WIB)",
      value: s.check_in_time.slice(0, 5),
      type: "time",
      required: true,
    },
    {
      name: "check_out_time",
      label: "Check-out time (WIB)",
      value: s.check_out_time.slice(0, 5),
      type: "time",
      required: true,
    },
    {
      name: "default_currency",
      label: "Currency code (e.g. IDR, USD, SGD)",
      value: s.default_currency,
      max: 3,
      required: true,
      pattern: "[A-Za-z]{3}",
    },
    {
      name: "tax_percentage",
      label: "Room tax (%)",
      value: String(s.tax_percentage),
      type: "number",
      required: true,
    },
    {
      name: "service_charge_percentage",
      label: "Room service charge (%)",
      value: String(s.service_charge_percentage),
      type: "number",
      required: true,
    },
    {
      name: "reservation_prefix",
      label: "Reservation prefix",
      value: s.reservation_prefix,
      max: 12,
      required: true,
      pattern: "[A-Za-z0-9-]{1,12}",
    },
  ];
  return (
    <form
      className="space-y-5 rounded-xl border bg-card p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        setError("");
        setSaved(false);
        start(async () => {
          try {
            const result = await saveHotelSettings({
              ...Object.fromEntries(d),
              version: s.version,
            });
            if ("error" in result) setError(result.error);
            else {
              setSaved(true);
              router.refresh();
            }
          } catch (e) {
            unstable_rethrow(e);
            setError(
              "Connection interrupted. Reload to verify whether settings were saved.",
            );
          }
        });
      }}
    >
      <fieldset disabled={pending} className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.name} className="block text-sm">
            {f.label}
            <input
              name={f.name}
              defaultValue={f.value}
              type={f.type ?? "text"}
              maxLength={f.max}
              required={f.required}
              pattern={f.pattern}
              min={f.type === "number" ? 0 : undefined}
              max={f.type === "number" ? 100 : undefined}
              step={f.type === "number" ? "0.01" : undefined}
              className="mt-1 h-10 w-full rounded-md border px-3"
            />
          </label>
        ))}
        <label className="text-sm sm:col-span-2">
          Address
          <textarea
            name="address"
            defaultValue={s.address ?? ""}
            maxLength={1000}
            rows={3}
            className="mt-1 w-full rounded-md border p-3"
          />
        </label>
      </fieldset>
      <p className="text-sm text-muted-foreground">
        Tax and service apply to new or repriced reservation quotes. Existing
        agreed prices and closed bills stay unchanged. Changing currency does
        not convert room prices; review room type prices before creating new
        bookings.
      </p>
      <p className="text-sm text-muted-foreground">
        Hotel contact details appear on newly printed bills, including old
        folios. The reservation prefix applies to new bookings; existing numbers
        remain unchanged. Times are defaults, not automatic arrival/departure
        restrictions.
      </p>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="text-emerald-800">
          Settings saved.
        </p>
      )}
      <Button disabled={pending}>
        {pending ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
