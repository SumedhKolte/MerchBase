import { Skeleton } from "@/components/ui/Skeleton";
import type { ViewMode } from "@/hooks/useViewMode";
import { cn } from "@/lib/cn";

function CardSkeletons({ count }: { count: number }) {
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex gap-3 rounded-2xl border border-line p-3 sm:flex-col">
          <Skeleton className="size-20 shrink-0 rounded-xl sm:aspect-square sm:size-auto sm:w-full" />
          <div className="flex-1 space-y-2.5 sm:px-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Mirrors the active layout (table or cards) so content doesn't jump when data arrives. */
export function ProductsSkeleton({
  rows,
  viewMode = "table",
}: {
  rows: number;
  viewMode?: ViewMode;
}) {
  const showTable = viewMode === "table";

  return (
    <div role="status" aria-label="Loading products">
      {showTable && (
        <div className="hidden md:block">
          <div className="h-10 border-b border-line bg-surface-muted/60" />
          <div className="divide-y divide-line">
            {Array.from({ length: rows }, (_, i) => (
              <div key={i} className="flex h-[65px] items-center gap-4 px-4">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="size-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3 w-1/5" />
                </div>
                <Skeleton className="hidden h-3.5 w-24 2xl:block" />
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="hidden h-3.5 w-12 lg:block" />
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </div>
      )}
      <div className={cn(showTable && "md:hidden")}>
        <CardSkeletons count={Math.min(rows, 8)} />
      </div>
    </div>
  );
}
