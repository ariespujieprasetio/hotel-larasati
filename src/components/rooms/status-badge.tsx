// localized-ui
import { T } from "@/components/i18n/language-provider";
import { statusColors, statusLabel, type RoomStatus } from "@/lib/rooms";
export function StatusBadge({ status }: { status: RoomStatus }) {
  return (
    <span
      className={
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold " +
        statusColors[status]
      }
    >
      <T>{statusLabel(status)}</T>
    </span>
  );
}
