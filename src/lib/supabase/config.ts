import { z } from "zod";
const configSchema = z.object({ url: z.url(), key: z.string().min(1) });
export function getSupabaseConfig() {
  const result = configSchema.safeParse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  return result.success ? result.data : null;
}
export function requireSupabaseConfig() {
  const config = getSupabaseConfig();
  if (!config)
    throw new Error(
      "Supabase is not configured. Follow the setup instructions in README.md.",
    );
  return config;
}

export const sessionCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};
