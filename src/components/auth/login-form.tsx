"use client";
// localized-ui
import { T } from "@/components/i18n/language-provider";

import { useState } from "react";
import { unstable_rethrow } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { login } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function LoginForm({ configured }: { configured: boolean }) {
  const [error, setError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  async function onSubmit(values: LoginInput) {
    setError(undefined);
    try {
      const result = await login(values);
      setError(result.error);
    } catch (error) {
      unstable_rethrow(error);
      setError("Unable to complete sign-in. Please try again.");
    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">
          <T>{"Email address"}</T>
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="you@hotellarasati.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        <T>
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </T>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">
          <T>{"Password"}</T>
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
        <T>
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </T>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          <T>{error}</T>
        </p>
      )}
      <Button
        type="submit"
        className="h-11 w-full"
        disabled={!configured || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="animate-spin" />
            <T>{"Signing in…"}</T>
          </>
        ) : (
          <>
            <T>{"Sign in"}</T>
            <ArrowRight />
          </>
        )}
      </Button>
    </form>
  );
}
