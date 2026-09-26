"use client";
import { useState } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roomSchema, type RoomInput } from "@/lib/validations/rooms";
import type { Room, RoomType } from "@/types/rooms";
import { saveRoom } from "@/app/(dashboard)/rooms/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, controlClass } from "./form-fields";
export function RoomForm({ room, types }: { room?: Room; types: RoomType[] }) {
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
        "Deactivate this room? It will be removed from active inventory.",
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
          <option value="">Select a room type</option>
          {types
            .filter((t) => t.is_active || t.id === room?.room_type_id)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {!t.is_active ? " (inactive)" : ""}
              </option>
            ))}
        </select>
      </Field>
      {!types.some((t) => t.is_active) && (
        <p className="text-sm text-amber-800">
          Create an active room type before adding a room.
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
        <textarea
          id="notes"
          rows={4}
          className={controlClass + " h-auto py-2"}
          {...register("notes")}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("is_active")} />
        Active room
      </label>
      <p className="text-sm text-muted-foreground">
        New rooms start as Available. Status changes are recorded separately on
        the room detail page.
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <Button disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save room"}
        </Button>
        <Button variant="outline" asChild>
          <Link href={room ? "/rooms/" + room.id : "/rooms"}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
