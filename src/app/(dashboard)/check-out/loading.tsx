// localized-ui
import { T } from "@/components/i18n/language-provider";
export default function Loading() {
  return (
    <div role="status" className="space-y-5">
      <span className="sr-only">
        <T>{"Loading billing data…"}</T>
      </span>
      <div className="h-20 animate-pulse rounded-xl bg-muted" />
      <div className="h-40 animate-pulse rounded-xl bg-muted" />
      <div className="h-64 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
