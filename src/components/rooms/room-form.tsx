"use client";
// localized-ui
import {
  T,
  LocalizedTextarea,
  LocalizedInput,
} from "@/components/i18n/language-provider";

import { useState } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/i18n/language-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roomSchema, type RoomInput } from "@/lib/validations/rooms";
import type { Room, RoomType } from "@/types/rooms";
import { saveRoom } from "@/app/(dashboard)/rooms/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, controlClass } from "./form-fields";
export function RoomForm({ room, types }: { room?: Room; types: RoomType[] }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoomInput>({
    resolver: zodResolver(roomSchema),
    defaultValues: room
      ? { ...room }
      : {
          room_number: "",
          room_type_id: "",
          floor: 1,
          notes: "",
          is_active: true,
        },
  });
  async function submit(values: RoomInput) {
    if (
      room?.is_active &&
      !values.is_active &&
      !window.confirm(
        t("Deactivate this room? It will be removed from active inventory."),
      )
    )
      return;
    setError("");
    try {
      const result = await saveRoom(values);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/rooms/" + result.id + "?saved=1");
      router.refresh();
    } catch (e) {
      unstable_rethrow(e);
      setError("Connection failed. Please try again.");
    }
  }
  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="max-w-2xl space-y-6 rounded-xl border bg-card p-6"
      noValidate
    >
      <Field
        name="room_number"
        label="Room number"
        error={errors.room_number?.message}
      >
        <Input
          id="room_number"
          maxLength={12}
          {...register("room_number")}
          aria-invalid={!!errors.room_number}
        />
      </Field>
      <Field
        name="room_type_id"
        label="Room type"
        error={errors.room_type_id?.message}
      >
        <select
          id="room_type_id"
          className={controlClass}
          {...register("room_type_id")}
        >
          <option value="">
            <T>{"Select a room type"}</T>
          </option>
          {types
            .filter((t) => t.is_active || t.id === room?.room_type_id)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                <T>{!t.is_active ? " (inactive)" : ""}</T>
              </option>
            ))}
        </select>
      </Field>
      {!types.some((t) => t.is_active) && (
        <p className="text-sm text-amber-800">
          <T>{"Create an active room type before adding a room."}</T>
        </p>
      )}
      <Field name="floor" label="Floor" error={errors.floor?.message}>
        <Input
          id="floor"
          type="number"
          {...register("floor", { valueAsNumber: true })}
        />
      </Field>
      <Field
        name="notes"
        label="Operational notes"
        error={errors.notes?.message}
      >
        <LocalizedTextarea
          id="notes"
          rows={4}
          className={controlClass + " h-auto py-2"}
          {...register("notes")}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <LocalizedInput type="checkbox" {...register("is_active")} />
        <T>{"Active room"}</T>
      </label>
      <p className="text-sm text-muted-foreground">
        <T>
          {
            "New rooms start as Available. Status changes are recorded separately on the room detail page."
          }
        </T>
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          <T>{error}</T>
        </p>
      )}
      <div className="flex gap-3">
        <Button disabled={isSubmitting}>
          <T>{isSubmitting ? "Saving…" : "Save room"}</T>
        </Button>
        <Button variant="outline" asChild>
          <Link href={room ? "/rooms/" + room.id : "/rooms"}>
            <T>{"Cancel"}</T>
          </Link>
        </Button>
      </div>
    </form>
  );
}
