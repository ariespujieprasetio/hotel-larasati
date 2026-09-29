// localized-ui
import { T } from "@/components/i18n/language-provider";
import type { ReservationStatus } from "@/types/reservations";
const colors: Record<ReservationStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  CONFIRMED: "bg-emerald-100 text-emerald-900",
  CHECKED_IN: "bg-blue-100 text-blue-900",
  CHECKED_OUT: "bg-slate-100 text-slate-900",
  CANCELLED: "bg-red-100 text-red-900",
  NO_SHOW: "bg-orange-100 text-orange-900",
};
export function ReservationBadge({ status }: { status: ReservationStatus }) {
  return (
    <span
      className={
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold " +
        colors[status]
      }
    >
      <T>{status.replaceAll("_", " ")}</T>
    </span>
  );
}
