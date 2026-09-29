// localized-ui
import { T } from "@/components/i18n/language-provider";
import { Building2, ShieldCheck } from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/language-provider";
import { LoginForm } from "@/components/auth/login-form";
import { getSupabaseConfig } from "@/lib/supabase/config";
export const metadata = { title: "Staff sign in" };
export default function LoginPage() {
  const configured = Boolean(getSupabaseConfig());
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-14 text-sidebar-foreground lg:flex xl:p-20">
        <div className="flex items-center gap-3">
          <Building2 className="size-8 text-[#c3ab7d]" />
          <div>
            <p className="font-serif text-2xl tracking-[0.12em]">
              <T>{"HOTEL LARASATI"}</T>
            </p>
            <p className="mt-1 text-xs tracking-[0.22em] text-white/60">
              <T>{"HOSPITALITY, MADE PERSONAL"}</T>
            </p>
          </div>
        </div>
        <div className="relative z-10 max-w-lg">
          <p className="premium-eyebrow mb-6 text-[#c3ab7d]">
            <T>{"THE ART OF HOSPITALITY"}</T>
          </p>
          <h1 className="font-serif text-5xl leading-[1.15] tracking-tight xl:text-6xl">
            <T>{"Exceptional stays."}</T>
            <br />
            <span className="italic text-[#d2bd94]">
              <T>{"Thoughtfully managed."}</T>
            </span>
          </h1>
          <p className="mt-7 max-w-sm text-sm leading-7 text-[#bab8af]">
            <T>
              {
                "The details behind every warm welcome. One quiet place to care for your guests, your rooms, and your team."
              }
            </T>
          </p>
        </div>
        <p className="text-sm text-white/50">
          <T>{"Hotel Larasati · Staff workspace"}</T>
        </p>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-44 -bottom-72 h-[48rem] w-[35rem] rounded-t-full border border-[#c3ab7d]/20 shadow-[0_0_0_32px_#c3ab7d05,0_0_0_64px_#c3ab7d05]"
        />
      </section>
      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-end">
            <LanguageSwitcher />
          </div>
          <div className="mb-10 flex items-center gap-2 font-semibold lg:hidden">
            <Building2 className="text-primary" />
            <T>{"Hotel Larasati"}</T>
          </div>
          <span className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck />
          </span>
          <h2 className="font-serif text-4xl tracking-tight">
            <T>{"Welcome back"}</T>
          </h2>
          <p className="mt-3 mb-8 text-sm text-muted-foreground">
            <T>{"Sign in with your staff account to continue."}</T>
          </p>
          {!configured && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
            >
              <p className="font-semibold">
                <T>{"Setup required"}</T>
              </p>
              <p className="mt-1">
                <T>
                  {
                    "Connect Supabase to enable staff sign-in. Your administrator can follow the project README."
                  }
                </T>
              </p>
            </div>
          )}
          <LoginForm configured={configured} />
          <p className="mt-8 text-center text-sm text-muted-foreground">
            <T>{"Need access? Contact your hotel administrator."}</T>
          </p>
          <p className="mt-12 text-center text-xs text-muted-foreground">
            <T>{"Authorized hotel staff only"}</T>
          </p>
        </div>
      </section>
    </main>
  );
}
