"use client";
// localized-ui
import {
  T,
  LocalizedTextarea,
  LocalizedInput,
} from "@/components/i18n/language-provider";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/language-provider";
import { useState } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { guestSchema, type GuestInput } from "@/lib/validations/guests";
import { identityTypes, jakartaDate } from "@/lib/guests";
import type { Guest } from "@/types/guests";
import { saveGuest } from "@/app/(dashboard)/guests/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
const control =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring";
const fields = [
  { name: "full_name", label: "Full name", type: "text", max: 150 },
  {
    name: "id_number",
    label: "Identity number (optional)",
    type: "text",
    max: 80,
  },
  { name: "nationality", label: "Nationality", type: "text", max: 80 },
  { name: "date_of_birth", label: "Date of birth", type: "date", max: 10 },
  { name: "phone", label: "Phone", type: "tel", max: 40 },
  { name: "email", label: "Email", type: "email", max: 254 },
  { name: "company_name", label: "Company name", type: "text", max: 150 },
] as const;
export function GuestForm({ guest }: { guest?: Guest }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GuestInput>({
    resolver: zodResolver(guestSchema),
    defaultValues: guest
      ? { ...guest, date_of_birth: guest.date_of_birth ?? "" }
      : {
          full_name: "",
          id_type: "OTHER",
          id_number: "",
          nationality: "",
          gender: "",
          date_of_birth: "",
          phone: "",
          email: "",
          address: "",
          company_name: "",
          notes: "",
          is_active: true,
        },
  });
  async function submit(values: GuestInput) {
    if (
      guest?.is_active &&
      !values.is_active &&
      !window.confirm(
        t("Deactivate this guest? Their record and history will be retained."),
      )
    )
      return;
    setError("");
    try {
      const result = await saveGuest(values);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/guests/" + result.id + "?saved=1");
      router.refresh();
    } catch (e) {
      unstable_rethrow(e);
      setError("Connection failed. Please try again.");
    }
  }
  return (
    <form
      noValidate
      onSubmit={handleSubmit(submit)}
      className="max-w-4xl space-y-6 rounded-xl border bg-card p-6"
    >
      <p className="text-sm text-muted-foreground">
        <T>
          {
            "Full name is required. Identity and contact details can be completed later. Guest codes are assigned automatically."
          }
        </T>
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="id_type">
            <T>{"Identity type"}</T>
          </Label>
          <select id="id_type" className={control} {...register("id_type")}>
            {identityTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">
            <T>{"Gender"}</T>
          </Label>
          <select id="gender" className={control} {...register("gender")}>
            <option value="">
              <T>{"Not recorded"}</T>
            </option>
            <option value="MALE">
              <T>{"Male"}</T>
            </option>
            <option value="FEMALE">
              <T>{"Female"}</T>
            </option>
            <option value="OTHER">
              <T>{"Other"}</T>
            </option>
            <option value="PREFER_NOT_TO_SAY">
              <T>{"Prefer not to say"}</T>
            </option>
          </select>
        </div>
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              <T>{field.label}</T>
            </Label>
            <Input
              id={field.name}
              type={field.type}
              maxLength={field.max}
              max={field.type === "date" ? jakartaDate() : undefined}
              min={field.type === "date" ? "1900-01-01" : undefined}
              {...register(field.name)}
              aria-invalid={!!errors[field.name]}
              aria-describedby={
                errors[field.name] ? field.name + "-error" : undefined
              }
            />
            <T>
              {errors[field.name] && (
                <p
                  role="alert"
                  id={field.name + "-error"}
                  className="text-sm text-destructive"
                >
                  {errors[field.name]?.message}
                </p>
              )}
            </T>
          </div>
        ))}
      </div>
      {(["address", "notes"] as const).map((name) => (
        <div key={name} className="space-y-2">
          <Label htmlFor={name}>
            <T>{name === "address" ? "Address" : "Guest notes"}</T>
          </Label>
          <LocalizedTextarea
            id={name}
            rows={3}
            maxLength={name === "address" ? 1000 : 2000}
            className={control}
            {...register(name)}
            aria-invalid={!!errors[name]}
          />
          <T>
            {errors[name] && (
              <p role="alert" className="text-sm text-destructive">
                {errors[name]?.message}
              </p>
            )}
          </T>
        </div>
      ))}
      <label className="flex items-center gap-2 text-sm">
        <LocalizedInput type="checkbox" {...register("is_active")} />
        <T>{"Active guest record"}</T>
      </label>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          <T>{error}</T>
        </p>
      )}
      <div className="flex gap-3">
        <Button disabled={isSubmitting}>
          <T>{isSubmitting ? "Saving…" : "Save guest"}</T>
        </Button>
        <Button asChild variant="outline">
          <Link href={guest ? "/guests/" + guest.id : "/guests"}>
            <T>{"Cancel"}</T>
          </Link>
        </Button>
      </div>
    </form>
  );
}
