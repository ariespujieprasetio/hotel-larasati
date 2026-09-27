export default function Loading() {
  return (
    <div role="status" className="space-y-5">
      <span className="sr-only">Loading hotel settings...</span>
      <div className="h-20 animate-pulse rounded-xl bg-muted" />
      <div className="h-40 animate-pulse rounded-xl bg-muted" />
      <div className="h-64 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
