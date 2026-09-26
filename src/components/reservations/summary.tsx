import { money } from "@/lib/reservations";
import type { ReservationPreview } from "@/types/reservations";
export function QuoteSummary({
  quote,
}: {
  quote: Omit<ReservationPreview, "rooms">;
}) {
  return (
    <dl className="grid gap-3 rounded-xl bg-muted/50 p-5 text-sm sm:grid-cols-2">
      {[
        [
          "Room charges (" +
            quote.nights +
            " nights × " +
            money(quote.nightly_rate, quote.currency) +
            ")",
          quote.room_subtotal,
        ],
        ["Discount", -quote.discount_amount],
        [
          "Service charge (" + quote.service_percentage + "%)",
          quote.service_amount,
        ],
        ["Tax (" + quote.tax_percentage + "%)", quote.tax_amount],
        ["Grand total", quote.total_amount],
      ].map(([label, amount]) => (
        <div key={String(label)} className="flex justify-between gap-4">
          <dt>{label}</dt>
          <dd className="font-semibold">
            {money(Number(amount), quote.currency)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
