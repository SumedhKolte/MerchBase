import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  // A <span> so it is also valid inside buttons and other phrasing-only parents.
  return (
    <span aria-hidden className={cn("block animate-pulse rounded-md bg-line/70", className)} />
  );
}
