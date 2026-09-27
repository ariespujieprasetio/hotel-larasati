import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig, sessionCookieOptions } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store");
  const config = getSupabaseConfig();
  if (!config) {
    if (
      request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/housekeeping") ||
      request.nextUrl.pathname.startsWith("/users") ||
      request.nextUrl.pathname.startsWith("/settings") ||
      request.nextUrl.pathname.startsWith("/rooms") ||
      request.nextUrl.pathname.startsWith("/guests") ||
      request.nextUrl.pathname.startsWith("/folios") ||
      request.nextUrl.pathname.startsWith("/payments") ||
      request.nextUrl.pathname.startsWith("/check-out") ||
      request.nextUrl.pathname.startsWith("/check-in") ||
      request.nextUrl.pathname.startsWith("/in-house") ||
      request.nextUrl.pathname.startsWith("/reservations")
    ) {
      const redirect = NextResponse.redirect(new URL("/login", request.url));
      redirect.headers.set("Cache-Control", "private, no-store");
      return redirect;
    }
    return response;
  }
  const supabase = createServerClient<Database>(config.url, config.key, {
    cookieOptions: sessionCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        response.headers.set("Cache-Control", "private, no-store");
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  const { data, error } = await supabase.auth.getUser();
  if (
    (error || !data.user) &&
    (request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/housekeeping") ||
      request.nextUrl.pathname.startsWith("/users") ||
      request.nextUrl.pathname.startsWith("/settings") ||
      request.nextUrl.pathname.startsWith("/rooms") ||
      request.nextUrl.pathname.startsWith("/guests") ||
      request.nextUrl.pathname.startsWith("/folios") ||
      request.nextUrl.pathname.startsWith("/payments") ||
      request.nextUrl.pathname.startsWith("/check-out") ||
      request.nextUrl.pathname.startsWith("/check-in") ||
      request.nextUrl.pathname.startsWith("/in-house") ||
      request.nextUrl.pathname.startsWith("/reservations"))
  ) {
    const redirect = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    redirect.headers.set("Cache-Control", "private, no-store");
    return redirect;
  }
  return response;
}
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/rooms/:path*",
    "/housekeeping/:path*",
    "/guests/:path*",
    "/reservations/:path*",
    "/check-in/:path*",
    "/check-out/:path*",
    "/folios/:path*",
    "/payments/:path*",
    "/in-house/:path*",
    "/login",
  ],
};
