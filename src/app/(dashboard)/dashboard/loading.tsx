export default function Loading() {
  return (
    <div role="status" aria-label="Loading dashboard" className="space-y-6">
      <div className="h-20 animate-pulse rounded-xl bg-muted" />
      <div className="h-40 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <span className="sr-only">Loading dashboard…</span>
    </div>
  );
}
