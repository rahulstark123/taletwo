import { Skeleton } from "@/components/ui/skeleton";

/** Route-level loading skeleton for every /app page. */
export default function AppLoading() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading your space" className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-44 rounded-card" />
        <Skeleton className="h-44 rounded-card" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-72 rounded-card" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-56 rounded-card" />
            <Skeleton className="h-56 rounded-card" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 rounded-card" />
          <Skeleton className="h-52 rounded-card" />
          <Skeleton className="h-48 rounded-card" />
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
