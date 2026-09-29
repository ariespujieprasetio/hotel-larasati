// localized-ui
import { T } from "@/components/i18n/language-provider";
import Link from "next/link";
import { listPayments } from "@/lib/services/billing";
import { billingPage, billingDate } from "@/lib/billing";
import { money } from "@/lib/reservations";
export const metadata = { title: "Payments" };
export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = billingPage((await searchParams).page);
  const { payments, folios, count } = await listPayments(page);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">
        <T>{"Payments"}</T>
      </h1>
      <p className="text-muted-foreground">
        <T>
          {
            "Recorded receipts and corrections. Open a bill to record a payment."
          }
        </T>
      </p>
      <Link href="/folios" className="underline">
        <T>{"Open bills"}</T>
      </Link>
      <div className="divide-y rounded-xl border bg-card">
        {!payments.length && (
          <p className="p-6">
            <T>{"No payments recorded."}</T>
          </p>
        )}
        <T>
          {payments.map((p) => {
            const f = folios.find((f) => f.id === p.folio_id);
            return (
              <article key={p.id} className="space-y-2 p-5">
                <Link
                  href={"/folios/" + p.folio_id}
                  className="font-semibold underline"
                >
                  {f?.folio_number} &middot; {f?.reservation_number}
                </Link>
                <p>
                  {p.kind === "REVERSAL" ? "Reversal" : "Payment"} &middot;{" "}
                  {money(p.amount, f?.currency)} &middot;{" "}
                  {p.method.replaceAll("_", " ")}
                </p>
                <p className="text-sm">
                  {billingDate(p.created_at)} WIB &middot;{" "}
                  {p.reference || "Cash"}
                </p>
                {p.reason && <p className="text-sm">Reason: {p.reason}</p>}
              </article>
            );
          })}
        </T>
      </div>
      <nav aria-label="Pagination" className="flex gap-4">
        {page > 1 && (
          <Link href={"?page=" + (page - 1)}>
            <T>{"Previous"}</T>
          </Link>
        )}
        <span>
          <T>{"Page "}</T>
          {page}
        </span>
        {page * 20 < count && (
          <Link href={"?page=" + (page + 1)}>
            <T>{"Next"}</T>
          </Link>
        )}
      </nav>
    </div>
  );
}
