"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format, parseISO } from "date-fns";
import {
  reservationSchema,
  type ReservationInput,
} from "@/lib/validations/reservations";
import { reservationSources, money } from "@/lib/reservations";
import { jakartaDate } from "@/lib/guests";
import type { RoomType } from "@/types/rooms";
import type { Role } from "@/types/database";
import type {
  Reservation,
  ReservationPreview,
  GuestOption,
} from "@/types/reservations";
import {
  previewReservation,
  saveReservation,
  searchReservationGuests,
} from "@/app/(dashboard)/reservations/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuoteSummary } from "./summary";
const controlClass = "h-10 w-full rounded-md border bg-background px-3 text-sm";
function quoteKey(values: Partial<ReservationInput>) {
  return JSON.stringify([
    values.id,
    values.version,
    values.room_type_id,
    values.check_in_date,
    values.check_out_date,
    values.adults,
    values.children,
    values.discount_amount,
  ]);
}
export function ReservationForm({
  types,
  role,
  reservation,
  initialGuest,
}: {
  types: RoomType[];
  role: Role;
  reservation?: Reservation;
  initialGuest?: GuestOption;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [quote, setQuote] = useState<{
    key: string;
    data: ReservationPreview;
  } | null>(null);
  const [guest, setGuest] = useState(initialGuest);
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("full_name");
  const [results, setResults] = useState<GuestOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState("");
  const today = jakartaDate();
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: reservation
      ? {
          ...reservation,
          status: reservation.status === "PENDING" ? "PENDING" : "CONFIRMED",
          source: reservation.source as ReservationInput["source"],
          expected_total: reservation.total_amount,
          expected_currency: reservation.currency,
        }
      : {
          guest_id: initialGuest?.id ?? "",
          room_type_id: "",
          room_id: "",
          check_in_date: today,
          check_out_date: format(addDays(parseISO(today), 1), "yyyy-MM-dd"),
          adults: 1,
          children: 0,
          discount_amount: 0,
          source: "DIRECT",
          status: "CONFIRMED",
          special_request: "",
          notes: "",
          expected_total: 0,
          expected_currency: "IDR",
        },
  });
  const values = useWatch({ control });
  const currentQuote = quote?.key === quoteKey(values) ? quote.data : null;
  const canDiscount = role === "OWNER" || role === "MANAGER";
  async function check() {
    setError("");
    setChecking(true);
    const input = getValues();
    const key = quoteKey(input);
    try {
      const result = await previewReservation(input);
      if ("error" in result) {
        setQuote(null);
        setError(result.error);
        return;
      }
      setQuote({ key, data: result.data });
      setValue("expected_total", result.data.total_amount);
      setValue("expected_currency", result.data.currency);
      if (!result.data.rooms.some((room) => room.id === getValues("room_id")))
        setValue("room_id", "");
    } catch (e) {
      unstable_rethrow(e);
      setError("Availability could not be checked.");
    } finally {
      setChecking(false);
    }
  }
  async function submit(input: ReservationInput) {
    if (!quote || quote.key !== quoteKey(input)) {
      setError("Check availability before saving.");
      return;
    }
    setError("");
    try {
      const result = await saveReservation({
        ...input,
        expected_total: quote.data.total_amount,
        expected_currency: quote.data.currency,
      });
      if ("error" in result) {
        setError(result.error);
        setQuote(null);
        return;
      }
      router.push("/reservations/" + result.id + "?saved=1");
      router.refresh();
    } catch (e) {
      unstable_rethrow(e);
      setError("Connection failed. Please try again.");
    }
  }
  async function findGuests() {
    setSearching(true);
    setSearchError("");
    try {
      const result = await searchReservationGuests({
        q: search,
        field: searchField,
      });
      if ("error" in result) {
        setSearchError(result.error);
        setResults([]);
      } else {
        setResults(result.data);
        setSearched(true);
      }
    } catch (e) {
      unstable_rethrow(e);
      setSearchError("Guest search failed.");
    } finally {
      setSearching(false);
    }
  }
  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="space-y-6">
      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">1. Guest</h2>
        {guest && (
          <p className="rounded-lg bg-muted p-3 text-sm">
            Selected: <strong>{guest.full_name}</strong> · {guest.guest_code}
          </p>
        )}
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            Search by
            <select
              className={controlClass}
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            >
              <option value="full_name">Name</option>
              <option value="phone">Phone</option>
              <option value="guest_code">Guest code</option>
            </select>
          </label>
          <label className="min-w-48 flex-1 text-sm">
            Find existing guest
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="At least two characters"
            />
          </label>
          <Button
            type="button"
            variant="outline"
            disabled={searching}
            onClick={findGuests}
          >
            {searching ? "Searching…" : "Find guest"}
          </Button>
          <Link
            href="/guests/new"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 text-sm underline"
          >
            Add guest in new tab
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          After adding a guest, search here to select them. Up to 20 matches are
          shown.
        </p>
        {searchError && (
          <p role="alert" className="text-sm text-destructive">
            {searchError}
          </p>
        )}
        {results.length > 0 && (
          <ul className="max-h-52 divide-y overflow-y-auto rounded-lg border">
            {results.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  className="w-full p-3 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    setGuest(option);
                    setValue("guest_id", option.id, { shouldValidate: true });
                    setResults([]);
                    setSearched(false);
                  }}
                >
                  {option.full_name} · {option.guest_code} ·{" "}
                  {option.phone || "No phone"}
                </button>
              </li>
            ))}
          </ul>
        )}
        {searched && !results.length && (
          <p className="text-sm text-muted-foreground">
            No active guests found. Try a more specific search or add the guest.
          </p>
        )}
        {errors.guest_id && (
          <p role="alert" className="text-sm text-destructive">
            {errors.guest_id.message}
          </p>
        )}
      </section>
      <section className="space-y-5 rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">2. Stay & room</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm">
            Check-in date
            <Input type="date" {...register("check_in_date")} />
          </label>
          <label className="text-sm">
            Check-out date
            <Input type="date" {...register("check_out_date")} />
          </label>
          <label className="text-sm">
            Room type
            <select className={controlClass} {...register("room_type_id")}>
              <option value="">Select a room type</option>
              {types
                .filter((t) => t.is_active)
                .map((t) => (
                  <option value={t.id} key={t.id}>
                    {t.name} · max {t.capacity} guests
                  </option>
                ))}
            </select>
          </label>
          <label className="text-sm">
            Adults
            <Input
              type="number"
              min={1}
              max={30}
              {...register("adults", { valueAsNumber: true })}
            />
          </label>
          <label className="text-sm">
            Children
            <Input
              type="number"
              min={0}
              max={29}
              {...register("children", { valueAsNumber: true })}
            />
          </label>
          <label className="text-sm">
            Discount amount
            <Input
              type="number"
              min={0}
              step="0.01"
              readOnly={!canDiscount}
              {...register("discount_amount", { valueAsNumber: true })}
            />
            <span className="text-xs text-muted-foreground">
              Owner/manager approval required.
            </span>
          </label>
        </div>
        <Button
          type="button"
          onClick={check}
          disabled={checking || isSubmitting}
        >
          {checking ? "Checking…" : "Check availability & price"}
        </Button>
        {currentQuote ? (
          <>
            <label className="block text-sm">
              Room assignment
              <select className={controlClass} {...register("room_id")}>
                <option value="">Assign an available room automatically</option>
                {currentQuote.rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Room {room.room_number} · {room.status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm text-muted-foreground">
              {currentQuote.rooms.length} rooms available for these dates.
              Dirty/cleaning rooms still require housekeeping before check-in.
            </p>
            {!currentQuote.rooms.length && (
              <p role="status" className="text-sm text-destructive">
                No rooms available. Change the dates or room type.
              </p>
            )}
            <QuoteSummary quote={currentQuote} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Check availability after changing dates, guest count, room type or
            discount.
          </p>
        )}
      </section>
      <section className="space-y-5 rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">3. Booking details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Source
            <select className={controlClass} {...register("source")}>
              {reservationSources.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          {!reservation && (
            <label className="text-sm">
              Initial status
              <select className={controlClass} {...register("status")}>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
              </select>
            </label>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="special_request">Special requests</Label>
          <textarea
            id="special_request"
            className={controlClass + " h-24 py-2"}
            maxLength={2000}
            {...register("special_request")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Staff notes</Label>
          <textarea
            id="notes"
            className={controlClass + " h-24 py-2"}
            maxLength={2000}
            {...register("notes")}
          />
        </div>
        {Object.entries(errors)
          .filter(([key]) => key !== "guest_id")
          .map(([key, value]) => (
            <p key={key} role="alert" className="text-sm text-destructive">
              {key.replaceAll("_", " ")}: {value.message}
            </p>
          ))}
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Pending bookings also hold a room. Saving reserves the stay; check-in
          and payments are handled separately.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={isSubmitting || checking || !currentQuote?.rooms.length}
          >
            {isSubmitting
              ? "Saving…"
              : reservation
                ? "Save changes"
                : "Create reservation"}
          </Button>
          <Button variant="outline" asChild>
            <Link
              href={
                reservation
                  ? "/reservations/" + reservation.id
                  : "/reservations"
              }
            >
              Cancel
            </Link>
          </Button>
        </div>
        {currentQuote && (
          <p className="text-xs text-muted-foreground">
            Review total:{" "}
            {money(currentQuote.total_amount, currentQuote.currency)}.
            Availability is checked again when saving.
          </p>
        )}
      </section>
    </form>
  );
}
