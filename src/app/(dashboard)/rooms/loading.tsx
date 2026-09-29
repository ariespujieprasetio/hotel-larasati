// localized-ui
import { T } from "@/components/i18n/language-provider";
export default function RoomsLoading() {
  return (
    <div role="status" className="space-y-4">
      <span className="sr-only">
        <T>{"Loading room inventory…"}</T>
      </span>
      <div className="h-16 animate-pulse rounded-xl bg-muted" />
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
      <div className="h-64 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
