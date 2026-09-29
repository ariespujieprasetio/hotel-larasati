"use client";
// localized-ui
import { T, LocalizedInput } from "@/components/i18n/language-provider";

import { useState, useTransition } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import { createStaff, updateStaff } from "@/app/(dashboard)/users/actions";
import { staffRoles } from "@/lib/staff";
import type { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";
export function StaffForm({
  staff,
  currentUserId,
}: {
  staff?: Profile;
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const own = staff?.id === currentUserId;
  return (
    <form
      className="max-w-2xl space-y-5 rounded-xl border bg-card p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        const values = {
          full_name: String(data.get("full_name")),
          phone: String(data.get("phone")),
          role: own ? staff!.role : String(data.get("role")),
          is_active: own ? staff!.is_active : data.get("is_active") === "on",
        };
        setError("");
        startTransition(async () => {
          try {
            const result = staff
              ? await updateStaff({
                  ...values,
                  id: staff.id,
                  version: staff.version,
                })
              : await createStaff({
                  ...values,
                  email: String(data.get("email")),
                  password: String(data.get("password")),
                  verified: data.get("verified") === "on",
                });
            if ("error" in result) setError(result.error);
            else {
              form.reset();
              router.push(
                "/users/" +
                  result.id +
                  (result.incomplete ? "?setup=pending" : "?saved=1"),
              );
              router.refresh();
            }
          } catch (e) {
            unstable_rethrow(e);
            setError(
              "The request was interrupted. Review the Users list before retrying.",
            );
          }
        });
      }}
    >
      <fieldset disabled={pending} className="space-y-4">
        <label className="block text-sm">
          <T>{"Full name"}</T>
          <LocalizedInput
            name="full_name"
            defaultValue={staff?.full_name ?? ""}
            maxLength={150}
            required
            autoComplete="name"
            className="mt-1 h-10 w-full rounded-md border px-3"
          />
        </label>
        {staff ? (
          <div className="text-sm">
            <T>{"Email: "}</T>
            <span className="font-medium">{staff.email}</span>
            <p className="mt-1 text-muted-foreground">
              <T>
                {"Email changes are managed through Supabase Authentication."}
              </T>
            </p>
          </div>
        ) : (
          <>
            <label className="block text-sm">
              <T>{"Staff email"}</T>
              <LocalizedInput
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="off"
                className="mt-1 h-10 w-full rounded-md border px-3"
              />
            </label>
            <label className="block text-sm">
              <T>{"Initial password"}</T>
              <LocalizedInput
                name="password"
                type="password"
                required
                minLength={12}
                maxLength={72}
                autoComplete="new-password"
                className="mt-1 h-10 w-full rounded-md border px-3"
              />
            </label>
            <p className="text-sm text-muted-foreground">
              <T>
                {
                  "Use at least 12 characters. Give the credentials directly to the staff member; no invitation email is sent."
                }
              </T>
            </p>
          </>
        )}
        <label className="block text-sm">
          <T>{"Phone (optional)"}</T>
          <LocalizedInput
            name="phone"
            type="tel"
            defaultValue={staff?.phone ?? ""}
            maxLength={40}
            className="mt-1 h-10 w-full rounded-md border px-3"
          />
        </label>
        <label className="block text-sm">
          <T>{"Role"}</T>
          <select
            name="role"
            disabled={own}
            defaultValue={staff?.role ?? "HOUSEKEEPING"}
            className="mt-1 h-10 w-full rounded-md border px-3"
          >
            <T>
              {staffRoles.map((role) => (
                <option key={role} value={role}>
                  {role.replaceAll("_", " ")}
                </option>
              ))}
            </T>
          </select>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <LocalizedInput
            name="is_active"
            type="checkbox"
            disabled={own}
            defaultChecked={staff?.is_active ?? true}
            className="mt-1"
          />
          <T>{"Active account - allow access according to this role"}</T>
        </label>
        {own && (
          <p className="text-sm text-muted-foreground">
            <T>
              {"Ask another owner to change your own role or active status."}
            </T>
          </p>
        )}
        {staff && (
          <p className="text-sm text-muted-foreground">
            <T>
              {
                "Deactivation removes app access. Existing housekeeping assignments remain in history; reassign open jobs in Housekeeping."
              }
            </T>
          </p>
        )}
        {!staff && (
          <label className="flex items-start gap-2 text-sm">
            <LocalizedInput
              name="verified"
              type="checkbox"
              required
              className="mt-1"
            />
            <T>
              {
                "I verified that this email belongs to the staff member and approve this account."
              }
            </T>
          </label>
        )}
        <Button disabled={pending}>
          {pending
            ? "Saving..."
            : staff
              ? "Save staff"
              : "Create staff account"}
        </Button>
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          <T>{error}</T>
        </p>
      )}
    </form>
  );
}
