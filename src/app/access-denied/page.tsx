// localized-ui
import { T } from "@/components/i18n/language-provider";
import { logout } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
export default function AccessDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="max-w-md rounded-2xl border bg-card p-8">
        <h1 className="text-2xl font-semibold">
          <T>{"Staff access required"}</T>
        </h1>
        <p className="my-4 text-muted-foreground">
          <T>
            {
              "Your staff profile is missing or inactive. Ask your hotel administrator to activate your account."
            }
          </T>
        </p>
        <form action={logout}>
          <Button>
            <T>{"Return to sign in"}</T>
          </Button>
        </form>
      </section>
    </main>
  );
}
