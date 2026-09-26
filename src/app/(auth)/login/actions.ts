"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { loginSchema } from "@/lib/validations/auth";

export async function login(input: unknown): Promise<{ error: string }> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success)
    return { error: "Enter a valid email address and password." };
  if (!getSupabaseConfig())
    return { error: "Sign-in is not configured. Contact your administrator." };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error || !data.user)
      return {
        error:
          "Unable to sign in. Check your credentials or try again shortly.",
      };
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profileError || !profile?.is_active) {
      await supabase.auth.signOut({ scope: "local" });
      return {
        error:
          "Staff access is unavailable. Contact your administrator to activate your profile.",
      };
    }
  } catch {
    return {
      error: "The sign-in service could not be reached. Please try again.",
    };
  }
  redirect("/dashboard");
}
export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw new Error("Unable to sign out. Please try again.");
  redirect("/login");
}
