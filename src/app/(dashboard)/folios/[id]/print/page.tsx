import Link from "next/link";
import { getPrintableFolio } from "@/lib/services/billing";
import { money } from "@/lib/reservations";
import { billingDate } from "@/lib/billing";
import { PrintButton } from "@/components/billing/print-button";
import "./print.css";
export const metadata = {
  title: "Guest bill",
  robots: { index: false, follow: false },
};
export default async function PrintFolio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const d = await getPrintableFolio(id);
  const f = d.folio;
  const q = f.charges;
  const rows = [
    [
      "Room subtotal (" +
        q.nights +
        " nights x " +
        money(q.nightly_rate, f.currency) +
        ")",
      q.room_subtotal,
    ],
    ["Room discount", -q.discount_amount],
    ["Room service (" + q.service_percentage + "%)", q.service_amount],
    ["Room tax (" + q.tax_percentage + "%)", q.tax_amount],
  ] as const;
  return (
    <div className="bill-container">
      <nav className="bill-controls">
        <Link href={"/folios/" + id} className="underline">
          Back to bill
        </Link>
        <PrintButton />
        <p>
          Choose Save as PDF in the print dialog. Refresh this page before
          printing an open bill.
        </p>
      </nav>
      <article className="guest-bill">
        <header>
          <h1>{d.hotel.hotel_name}</h1>
          {d.hotel.address && (
            <p className="whitespace-pre-line">{d.hotel.address}</p>
          )}
          <p>{[d.hotel.phone, d.hotel.email].filter(Boolean).join(" | ")}</p>
        </header>
        <div className="bill-heading">
          <div>
            <h2>Guest bill</h2>
            <p>
              {f.folio_number} &middot; {f.reservation_number}
            </p>
          </div>
          <strong>
            {f.balance === 0 ? "PAID" : "BALANCE DUE"} &middot;{" "}
            {f.closed_at ? "CLOSED" : "OPEN"}
          </strong>
        </div>
        <dl className="bill-details">
          <div>
            <dt>Guest</dt>
            <dd>{f.guest_name}</dd>
          </div>
          <div>
            <dt>Room</dt>
            <dd>{f.room_number}</dd>
          </div>
          <div>
            <dt>Scheduled arrival</dt>
            <dd>{d.arrival}</dd>
          </div>
          <div>
            <dt>Scheduled departure</dt>
            <dd>{d.departure}</dd>
          </div>
          <div>
            <dt>Bill opened (WIB)</dt>
            <dd>{billingDate(f.created_at)}</dd>
          </div>
          <div>
            <dt>Bill closed (WIB)</dt>
            <dd>{f.closed_at ? billingDate(f.closed_at) : "Still open"}</dd>
          </div>
        </dl>
        <h3>Charges ({f.currency})</h3>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th className="amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <td>{label}</td>
                <td className="amount">{money(value, f.currency)}</td>
              </tr>
            ))}
            {d.extras.map((e) => (
              <tr key={e.id}>
                <td>
                  {e.description}
                  <span className="block text-xs">
                    {e.quantity} x {money(e.unit_price, f.currency)} (final
                    price)
                  </span>
                </td>
                <td className="amount">{money(e.amount, f.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="bill-totals">
          <div>
            <dt>Total bill</dt>
            <dd>{money(f.total_amount, f.currency)}</dd>
          </div>
          <div>
            <dt>Net payments</dt>
            <dd>{money(f.paid_amount, f.currency)}</dd>
          </div>
          <div>
            <dt>Balance due</dt>
            <dd>{money(f.balance, f.currency)}</dd>
          </div>
        </dl>
        <h3>Payment history</h3>
        {!d.payments.length ? (
          <p>No payments recorded.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date (WIB)</th>
                <th>Entry / method</th>
                <th className="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              {d.payments.map((p) => (
                <tr key={p.id}>
                  <td>{billingDate(p.created_at)}</td>
                  <td>
                    {p.kind === "REVERSAL" ? "Reversal" : "Payment"} /{" "}
                    {p.method.replaceAll("_", " ")}
                  </td>
                  <td className="amount">
                    {money(
                      p.kind === "REVERSAL" ? -p.amount : p.amount,
                      f.currency,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <footer>
          <p>
            Extra charges use final prices. Cancelled charges are excluded.
            Reversals reduce recorded payments.
          </p>
          <p>
            Generated {billingDate(d.generated_at)} WIB &middot; Bill version{" "}
            {f.version}. Hotel contact details are current at printing.
          </p>
          {!f.closed_at && (
            <p>This bill is open and may change before checkout.</p>
          )}
        </footer>
      </article>
    </div>
  );
}
