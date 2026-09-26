import { Building2, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { getSupabaseConfig } from "@/lib/supabase/config";
export const metadata = { title: "Staff sign in" };
export default function LoginPage() {
  const configured = Boolean(getSupabaseConfig());
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-14 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <Building2 className="size-9 text-amber-200" />
          <div>
            <p className="text-xl font-semibold tracking-wide">
              HOTEL LARASATI
            </p>
            <p className="mt-1 text-xs tracking-[0.22em] text-white/60">
              HOSPITALITY, MADE PERSONAL
            </p>
          </div>
        </div>
        <div className="relative z-10 max-w-lg">
          <p className="mb-5 text-sm font-medium tracking-widest text-amber-200">
            YOUR HOTEL. WORKING TOGETHER.
          </p>
          <h1 className="text-5xl leading-tight font-semibold">
            Thoughtful stays start behind the scenes.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-white/70">
            A shared workspace for the people who make every guest feel at home.
          </p>
        </div>
        <p className="text-sm text-white/50">
          Hotel Larasati · Staff workspace
        </p>
        <div
          aria-hidden="true"
          className="absolute -right-40 -bottom-36 size-[34rem] rounded-full border-[60px] border-white/5"
        />
      </section>
      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2 font-semibold lg:hidden">
            <Building2 className="text-primary" />
            Hotel Larasati
          </div>
          <span className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck />
          </span>
          <h2 className="text-3xl font-semibold tracking-tight">
            Welcome back
          </h2>
          <p className="mt-3 mb-8 text-sm text-muted-foreground">
            Sign in with your staff account to continue.
          </p>
          {!configured && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
            >
              <p className="font-semibold">Setup required</p>
              <p className="mt-1">
                Connect Supabase to enable staff sign-in. Your administrator can
                follow the project README.
              </p>
            </div>
          )}
          <LoginForm configured={configured} />
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Need access? Contact your hotel administrator.
          </p>
          <p className="mt-12 text-center text-xs text-muted-foreground">
            Authorized hotel staff only
          </p>
        </div>
      </section>
    </main>
  );
}
