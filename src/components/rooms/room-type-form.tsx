"use client";
// localized-ui
import {
  LocalizedTextarea,
  LocalizedInput,
  T,
} from "@/components/i18n/language-provider";

import { useState } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/i18n/language-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roomTypeSchema, type RoomTypeInput } from "@/lib/validations/rooms";
import type { RoomType } from "@/types/rooms";
import { saveRoomType } from "@/app/(dashboard)/rooms/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, controlClass } from "./form-fields";
export function RoomTypeForm({ roomType }: { roomType?: RoomType }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoomTypeInput>({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: roomType
      ? {
          ...roomType,
          size: roomType.size ?? 0,
          amenities: roomType.amenities.join(", "),
        }
      : {
          name: "",
          description: "",
          base_price: 0,
          capacity: 2,
          bed_type: "",
          size: 0,
          amenities: "",
          is_active: true,
        },
  });
  async function submit(values: RoomTypeInput) {
    if (
      roomType?.is_active &&
      !values.is_active &&
      !window.confirm(
        t(
          "Deactivate this room type? All its rooms must be inactive or reassigned first.",
        ),
      )
    )
      return;
    setError("");
    try {
      const result = await saveRoomType(values);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/rooms/types?saved=1");
      router.refresh();
    } catch (e) {
      unstable_rethrow(e);
      setError("Connection failed. Please try again.");
    }
  }
  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="max-w-2xl space-y-6 rounded-xl border bg-card p-6"
    >
      <Field name="name" label="Type name" error={errors.name?.message}>
        <Input id="name" {...register("name")} />
      </Field>
      <Field
        name="description"
        label="Description"
        error={errors.description?.message}
      >
        <LocalizedTextarea
          id="description"
          rows={3}
          className={controlClass + " h-auto py-2"}
          {...register("description")}
        />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          name="base_price"
          label="Base price per night (IDR)"
          error={errors.base_price?.message}
        >
          <Input
            id="base_price"
            type="number"
            step="0.01"
            min={0}
            {...register("base_price", { valueAsNumber: true })}
          />
        </Field>
        <Field
          name="capacity"
          label="Maximum guests"
          error={errors.capacity?.message}
        >
          <Input
            id="capacity"
            type="number"
            min={1}
            max={30}
            {...register("capacity", { valueAsNumber: true })}
          />
        </Field>
        <Field
          name="bed_type"
          label="Bed type"
          error={errors.bed_type?.message}
        >
          <Input
            id="bed_type"
            placeholder="Double / Twin"
            {...register("bed_type")}
          />
        </Field>
        <Field
          name="size"
          label="Size (m²; 0 if unspecified)"
          error={errors.size?.message}
        >
          <Input
            id="size"
            type="number"
            step="0.01"
            min={0}
            {...register("size", { valueAsNumber: true })}
          />
        </Field>
      </div>
      <Field
        name="amenities"
        label="Amenities (comma separated)"
        error={errors.amenities?.message}
      >
        <Input
          id="amenities"
          placeholder="Wi-Fi, AC, TV"
          {...register("amenities")}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <LocalizedInput type="checkbox" {...register("is_active")} />
        <T>{"Active room type"}</T>
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          <T>{error}</T>
        </p>
      )}
      <div className="flex gap-3">
        <Button disabled={isSubmitting}>
          <T>{isSubmitting ? "Saving…" : "Save room type"}</T>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/rooms/types">
            <T>{"Cancel"}</T>
          </Link>
        </Button>
      </div>
    </form>
  );
}
