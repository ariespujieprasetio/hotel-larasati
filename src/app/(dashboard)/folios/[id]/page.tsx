// localized-ui
import { T } from "@/components/i18n/language-provider";
import { ExtraForm, VoidExtraForm } from "@/components/billing/extra-form";
import Link from "next/link";
import { getFolio, getFolioExtras } from "@/lib/services/billing";
import { billingDate, billingPage } from "@/lib/billing";
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
  searchParams: Promise<{ checkedOut?: string; extrasPage?: string }>;
}) {
  const { id } = await params;
  const [{ folio: f, payments, paymentCount, role }, query] = await Promise.all(
    [getFolio(id), searchParams],
  );
  const extrasPage = billingPage(query.extrasPage);
  const { extras, count: extraCount } = await getFolioExtras(id, extrasPage);
  const roomTotal =
    Number(f.charges.room_subtotal) -
    Number(f.charges.discount_amount) +
    Number(f.charges.service_amount) +
    Number(f.charges.tax_amount);
  const reversals = new Set(payments.map((p) => p.reversal_of).filter(Boolean));
  return (
    <div className="space-y-6">
      <Link href="/folios" className="text-sm underline">
        <T>{"Back to bills"}</T>
      </Link>
      {query.checkedOut === "1" && f.closed_at && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 p-4 text-emerald-900"
        >
          <T>
            {
              "Check-out complete. The room is now DIRTY and ready for housekeeping."
            }
          </T>
        </p>
      )}
      <Link
        href={"/folios/" + id + "/print"}
        className="inline-block rounded-md border px-4 py-2 text-sm font-medium"
      >
        <T>{"Print / Save PDF"}</T>
      </Link>
      <header>
        <h1 className="text-3xl font-semibold">{f.folio_number}</h1>
        <p className="mt-2 text-muted-foreground">
          {f.guest_name}
          <T>{" \u00b7 Room "}</T>
          {f.room_number} &middot;<T> </T>
          {f.reservation_number}
        </p>
        <p className="mt-2 text-sm">
          {f.closed_at ? "Closed " + billingDate(f.closed_at) : "Open bill"}
          <T> </T>
          <T>{"\u00b7 WIB"}</T>
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-5 rounded-xl border bg-card p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold">
            <T>{"Agreed room charges"}</T>
          </h2>
          <QuoteSummary
            quote={{
              ...f.charges,
              currency: f.currency,
              total_amount: roomTotal,
            }}
          />
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">
                <T>{"Active extra charges"}</T>
              </dt>
              <dd className="text-xl font-semibold">
                {money(f.total_amount - roomTotal, f.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                <T>{"Total bill"}</T>
              </dt>
              <dd className="text-xl font-semibold">
                {money(f.total_amount, f.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                <T>{"Net payments"}</T>
              </dt>
              <dd className="text-xl font-semibold">
                {money(f.paid_amount, f.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                <T>{"Balance due"}</T>
              </dt>
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
              <T>{"View reservation and stay details"}</T>
            </Link>
          )}
          <p className="text-sm text-muted-foreground">
            <T>
              {
                "Room prices stay as agreed. Extra charges are added at their final price. Pre-arrival deposits and refund processing are not available yet."
              }
            </T>
          </p>
        </section>
        <aside className="space-y-6 rounded-xl border bg-card p-6">
          {!f.closed_at && (
            <ExtraForm
              folioId={f.id}
              version={f.version}
              currency={f.currency}
            />
          )}
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
              <T>
                {
                  "Front office or management completes check-out after the balance is settled."
                }
              </T>
            </p>
          )}
          {f.closed_at && (
            <p className="text-sm text-muted-foreground">
              <T>
                {
                  "This bill is closed. Payment entries and the departure record are retained for review."
                }
              </T>
            </p>
          )}
        </aside>
      </div>
      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">
          <T>{"Extra charge history"}</T>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {extraCount}
          <T>{" entries, including cancelled charges \u00b7 Page"}</T>
          <T> </T>
          {extrasPage}
        </p>
        {!extras.length && (
          <p className="mt-4 text-sm">
            <T>{"No extra charges on this page."}</T>
          </p>
        )}
        <ul className="divide-y">
          {extras.map((item) => (
            <li key={item.id} className="space-y-2 py-4">
              <p className="font-medium">
                {item.description} &middot; {money(item.amount, f.currency)}
                <T> </T>
                {item.voided_at && "(Cancelled)"}
              </p>
              <p className="text-sm">
                {item.quantity}
                <T>{" x "}</T>
                {money(item.unit_price, f.currency)} &middot;<T> </T>
                {billingDate(item.created_at)}
                <T>{" WIB"}</T>
              </p>
              <p className="break-all text-xs text-muted-foreground">
                <T>{"Entry: "}</T>
                {item.id}
                <T>{" \u00b7 Staff: "}</T>
                {item.created_by}
              </p>
              {item.voided_at && (
                <p className="text-sm">
                  <T>{"Cancelled "}</T>
                  {billingDate(item.voided_at)}
                  <T>{" WIB by"}</T>
                  <T> </T>
                  {item.voided_by}: {item.void_reason}
                </p>
              )}
              {!f.closed_at &&
                !item.voided_at &&
                ["OWNER", "MANAGER"].includes(role) && (
                  <VoidExtraForm extraId={item.id} version={f.version} />
                )}
            </li>
          ))}
        </ul>
        <nav
          aria-label="Extra charge pages"
          className="mt-4 flex gap-4 text-sm underline"
        >
          {extrasPage > 1 && (
            <Link href={"/folios/" + f.id + "?extrasPage=" + (extrasPage - 1)}>
              <T>{"Previous charges"}</T>
            </Link>
          )}
          {extrasPage * 20 < extraCount && (
            <Link href={"/folios/" + f.id + "?extrasPage=" + (extrasPage + 1)}>
              <T>{"Next charges"}</T>
            </Link>
          )}
        </nav>
      </section>
      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">
          <T>{"Payment history"}</T>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          <T>{"Latest "}</T>
          {Math.min(paymentCount, 200)}
          <T>{" of "}</T>
          {paymentCount}
          <T>{" entries \u00b7 WIB"}</T>
        </p>
        {!payments.length && (
          <p className="mt-4 text-sm">
            <T>{"No payments recorded."}</T>
          </p>
        )}
        <ul className="mt-4 divide-y">
          <T>
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
          </T>
        </ul>
      </section>
    </div>
  );
}
