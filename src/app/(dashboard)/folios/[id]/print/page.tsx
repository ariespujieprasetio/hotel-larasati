// localized-ui
import { T } from "@/components/i18n/language-provider";
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
          <T>{"Back to bill"}</T>
        </Link>
        <PrintButton />
        <p>
          <T>
            {
              "Choose Save as PDF in the print dialog. Refresh this page before printing an open bill."
            }
          </T>
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
            <h2>
              <T>{"Guest bill"}</T>
            </h2>
            <p>
              {f.folio_number} &middot; {f.reservation_number}
            </p>
          </div>
          <strong>
            <T>{f.balance === 0 ? "PAID" : "BALANCE DUE"}</T> &middot;<T> </T>
            <T>{f.closed_at ? "CLOSED" : "OPEN"}</T>
          </strong>
        </div>
        <dl className="bill-details">
          <div>
            <dt>
              <T>{"Guest"}</T>
            </dt>
            <dd>{f.guest_name}</dd>
          </div>
          <div>
            <dt>
              <T>{"Room"}</T>
            </dt>
            <dd>{f.room_number}</dd>
          </div>
          <div>
            <dt>
              <T>{"Scheduled arrival"}</T>
            </dt>
            <dd>{d.arrival}</dd>
          </div>
          <div>
            <dt>
              <T>{"Scheduled departure"}</T>
            </dt>
            <dd>{d.departure}</dd>
          </div>
          <div>
            <dt>
              <T>{"Bill opened (WIB)"}</T>
            </dt>
            <dd>{billingDate(f.created_at)}</dd>
          </div>
          <div>
            <dt>
              <T>{"Bill closed (WIB)"}</T>
            </dt>
            <dd>{f.closed_at ? billingDate(f.closed_at) : "Still open"}</dd>
          </div>
        </dl>
        <h3>
          <T>{"Charges ("}</T>
          {f.currency})
        </h3>
        <table>
          <thead>
            <tr>
              <th>
                <T>{"Description"}</T>
              </th>
              <th className="amount">
                <T>{"Amount"}</T>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <td>
                  <T>{label}</T>
                </td>
                <td className="amount">{money(value, f.currency)}</td>
              </tr>
            ))}
            {d.extras.map((e) => (
              <tr key={e.id}>
                <td>
                  {e.description}
                  <span className="block text-xs">
                    {e.quantity}
                    <T>{" x "}</T>
                    {money(e.unit_price, f.currency)}
                    <T>{" (final price)"}</T>
                  </span>
                </td>
                <td className="amount">{money(e.amount, f.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="bill-totals">
          <div>
            <dt>
              <T>{"Total bill"}</T>
            </dt>
            <dd>{money(f.total_amount, f.currency)}</dd>
          </div>
          <div>
            <dt>
              <T>{"Net payments"}</T>
            </dt>
            <dd>{money(f.paid_amount, f.currency)}</dd>
          </div>
          <div>
            <dt>
              <T>{"Balance due"}</T>
            </dt>
            <dd>{money(f.balance, f.currency)}</dd>
          </div>
        </dl>
        <h3>
          <T>{"Payment history"}</T>
        </h3>
        <T>
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
        </T>
        <footer>
          <p>
            <T>
              {
                "Extra charges use final prices. Cancelled charges are excluded. Reversals reduce recorded payments."
              }
            </T>
          </p>
          <p>
            <T>{"Generated "}</T>
            {billingDate(d.generated_at)}
            <T>{" WIB \u00b7 Bill version"}</T>
            <T> </T>
            {f.version}
            <T>{". Hotel contact details are current at printing."}</T>
          </p>
          {!f.closed_at && (
            <p>
              <T>{"This bill is open and may change before checkout."}</T>
            </p>
          )}
        </footer>
      </article>
    </div>
  );
}
