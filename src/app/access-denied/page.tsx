import { logout } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
export default function AccessDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="max-w-md rounded-2xl border bg-card p-8">
        <h1 className="text-2xl font-semibold">Staff access required</h1>
        <p className="my-4 text-muted-foreground">
          Your staff profile is missing or inactive. Ask your hotel
          administrator to activate your account.
        </p>
        <form action={logout}>
          <Button>Return to sign in</Button>
        </form>
      </section>
    </main>
  );
}
