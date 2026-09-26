import { statusColors, statusLabel, type RoomStatus } from "@/lib/rooms";
export function StatusBadge({ status }: { status: RoomStatus }) {
  return (
    <span
      className={
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold " +
        statusColors[status]
      }
    >
      {statusLabel(status)}
    </span>
  );
}
