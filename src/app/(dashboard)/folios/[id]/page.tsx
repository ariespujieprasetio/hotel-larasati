import Link from "next/link";
import { getFolio } from "@/lib/services/billing";
import { billingDate } from "@/lib/billing";
import { money, reservationRoles } from "@/lib/reservations";
import { QuoteSummary } from "@/components/reservations/summary";
import { PaymentForm } from "@/components/billing/payment-form";
import { CheckoutForm } from "@/components/billing/checkout-form";
import { ReversalForm } from "@/components/billing/reversal-form";
export const metadata = { title: "Guest bill" };
export default async function FolioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkedOut?: string }>;
}) {
  const { id } = await params;
  const [{ folio: f, payments, paymentCount, role }, query] = await Promise.all(
    [getFolio(id), searchParams],
  );
  const reversals = new Set(payments.map((p) => p.reversal_of).filter(Boolean));
  return (
    <div className="space-y-6">
      <Link href="/folios" className="text-sm underline">
        Back to bills
      </Link>
      {query.checkedOut === "1" && f.closed_at && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 p-4 text-emerald-900"
        >
          Check-out complete. The room is now DIRTY and ready for housekeeping.
        </p>
      )}
      <header>
        <h1 className="text-3xl font-semibold">{f.folio_number}</h1>
        <p className="mt-2 text-muted-foreground">
          {f.guest_name} &middot; Room {f.room_number} &middot;{" "}
          {f.reservation_number}
        </p>
        <p className="mt-2 text-sm">
          {f.closed_at ? "Closed " + billingDate(f.closed_at) : "Open bill"}{" "}
          &middot; WIB
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-5 rounded-xl border bg-card p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold">Agreed room charges</h2>
          <QuoteSummary
            quote={{
              ...f.charges,
              currency: f.currency,
              total_amount: f.total_amount,
            }}
          />
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Net payments</dt>
              <dd className="text-xl font-semibold">
                {money(f.paid_amount, f.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Balance due</dt>
              <dd className="text-xl font-semibold">
                {money(f.balance, f.currency)}
              </dd>
            </div>
          </dl>
          {reservationRoles.includes(role) && (
            <Link
              className="text-sm underline"
              href={"/reservations/" + f.reservation_id}
            >
              View reservation and stay details
            </Link>
          )}
          <p className="text-sm text-muted-foreground">
            This bill covers the saved room charges, discount, service charge
            and tax. Extras, deposits before arrival, and refund processing are
            not available yet.
          </p>
        </section>
        <aside className="space-y-6 rounded-xl border bg-card p-6">
          {!f.closed_at && f.balance > 0 && (
            <PaymentForm
              folioId={f.id}
              currency={f.currency}
              balance={f.balance}
            />
          )}
          {!f.closed_at && reservationRoles.includes(role) && (
            <CheckoutForm
              key={f.version}
              folioId={f.id}
              version={f.version}
              balance={f.balance}
            />
          )}
          {!f.closed_at && role === "FINANCE" && (
            <p className="text-sm text-muted-foreground">
              Front office or management completes check-out after the balance
              is settled.
            </p>
          )}
          {f.closed_at && (
            <p className="text-sm text-muted-foreground">
              This bill is closed. Payment entries and the departure record are
              retained for review.
            </p>
          )}
        </aside>
      </div>
      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">Payment history</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Latest {Math.min(paymentCount, 200)} of {paymentCount} entries
          &middot; WIB
        </p>
        {!payments.length && (
          <p className="mt-4 text-sm">No payments recorded.</p>
        )}
        <ul className="mt-4 divide-y">
          {payments.map((p) => (
            <li key={p.id} className="space-y-2 py-4">
              <p className="font-medium">
                {p.kind === "REVERSAL" ? "Reversal" : "Payment"} &middot;{" "}
                {money(p.amount, f.currency)} &middot;{" "}
                {p.method.replaceAll("_", " ")}
                {reversals.has(p.id) ? " \u00b7 Reversed" : ""}
              </p>
              <p className="text-sm">
                {billingDate(p.created_at)} &middot; Reference:{" "}
                {p.reference || "Cash"}
              </p>
              {p.reason && <p className="text-sm">Reason: {p.reason}</p>}
              <p className="break-all text-xs text-muted-foreground">
                Entry: {p.id} &middot; Staff: {p.created_by}
              </p>
              {!f.closed_at &&
                ["OWNER", "MANAGER"].includes(role) &&
                p.kind === "PAYMENT" &&
                !reversals.has(p.id) && <ReversalForm paymentId={p.id} />}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
