import { AlertTriangle, ArrowDownWideNarrow, PackageSearch, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { getStockLevel, isLowStock, LOW_STOCK_THRESHOLD, type StockLevel } from "@/lib/inventory";
import type { Product } from "@/types/product";

interface MetricsStripProps {
  products: Product[];
  catalogTotal: number | null;
  isLoading: boolean;
  isLowStockHighlighted: boolean;
  onToggleLowStock: () => void;
  onSortByRating: () => void;
}

const HEALTH_SEGMENTS: Array<{ level: StockLevel; label: string; color: string }> = [
  { level: "healthy", label: "Healthy", color: "bg-emerald-500" },
  { level: "low", label: "Low", color: "bg-amber-500" },
  { level: "critical", label: "Critical", color: "bg-red-500" },
];

function summarize(products: Product[]) {
  const rated = products.filter((product) => product.rating > 0);
  const levels: Record<StockLevel, number> = { healthy: 0, low: 0, critical: 0 };
  products.forEach((product) => levels[getStockLevel(product.stock)]++);
  return {
    levels,
    lowStock: products.filter((product) => isLowStock(product.stock)).length,
    averageRating: rated.length
      ? rated.reduce((sum, product) => sum + product.rating, 0) / rated.length
      : null,
  };
}

// flex-col: <button> cards would otherwise vertically center their content.
const cardClasses =
  "flex flex-col rounded-2xl border bg-surface p-4 text-left shadow-xs transition";
const interactiveClasses =
  "hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:hover:translate-y-0";

function CardHeader({
  label,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  icon: typeof Star;
  iconClassName?: string;
}) {
  return (
    <span className="flex items-center justify-between text-sm text-fg-muted">
      {label}
      <Icon className={cn("size-4", iconClassName ?? "text-fg-subtle")} aria-hidden />
    </span>
  );
}

export function MetricsStrip({
  products,
  catalogTotal,
  isLoading,
  isLowStockHighlighted,
  onToggleLowStock,
  onSortByRating,
}: MetricsStripProps) {
  const { levels, lowStock, averageRating } = summarize(products);
  const total = products.length;
  const value = (content: React.ReactNode, className?: string) =>
    isLoading ? (
      <Skeleton className="mt-2 h-8 w-16" />
    ) : (
      <span className={cn("mt-1 block text-2xl font-semibold tabular-nums", className)}>
        {content}
      </span>
    );

  return (
    <section aria-label="Summary metrics" className="grid gap-3 sm:grid-cols-3">
      {/* Inventory health: a segmented bar of the loaded rows' stock levels. */}
      <div className={cn(cardClasses, "border-line")}>
        <CardHeader label="Inventory health" icon={PackageSearch} />
        {value(
          <>
            {formatNumber(total)}{" "}
            <span className="text-sm font-normal text-fg-subtle">
              {catalogTotal === null ? "" : `of ${formatNumber(catalogTotal)}`}
            </span>
          </>,
        )}
        <div
          className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-surface-muted"
          role="img"
          aria-label={HEALTH_SEGMENTS.map(({ level, label }) => `${levels[level]} ${label}`).join(
            ", ",
          )}
        >
          {!isLoading &&
            HEALTH_SEGMENTS.map(({ level, color }) => (
              <span
                key={level}
                className={cn("transition-[width] duration-500", color)}
                style={{ width: total ? `${(levels[level] / total) * 100}%` : 0 }}
              />
            ))}
        </div>
        <ul className="mt-2 flex gap-3 text-xs text-fg-subtle">
          {HEALTH_SEGMENTS.map(({ level, label, color }) => (
            <li key={level} className="flex items-center gap-1.5 tabular-nums">
              <span className={cn("size-1.5 rounded-full", color)} aria-hidden />
              {label} {isLoading ? "–" : levels[level]}
            </li>
          ))}
        </ul>
      </div>

      {/* Low stock: toggles row highlighting on the current page. */}
      <button
        type="button"
        onClick={onToggleLowStock}
        aria-pressed={isLowStockHighlighted}
        disabled={isLoading}
        className={cn(
          cardClasses,
          interactiveClasses,
          isLowStockHighlighted
            ? "border-amber-400 ring-1 ring-amber-400 dark:border-amber-500/60 dark:ring-amber-500/60"
            : "border-line",
        )}
      >
        <CardHeader
          label="Low stock alerts"
          icon={AlertTriangle}
          iconClassName={lowStock > 0 ? "text-amber-500 motion-safe:animate-pulse" : undefined}
        />
        {value(
          formatNumber(lowStock),
          lowStock > 0 ? "text-amber-600 dark:text-amber-400" : undefined,
        )}
        <span className="mt-0.5 block text-xs text-fg-subtle">
          {isLowStockHighlighted
            ? "Highlighting rows · click to clear"
            : `stock ≤ ${LOW_STOCK_THRESHOLD} · click to highlight`}
        </span>
      </button>

      {/* Rating: one click to sort the table best-first. */}
      <button
        type="button"
        onClick={onSortByRating}
        disabled={isLoading}
        className={cn(cardClasses, interactiveClasses, "border-line")}
      >
        <CardHeader
          label="Average rating"
          icon={Star}
          iconClassName="fill-amber-400 text-amber-400"
        />
        {value(
          <>
            {averageRating === null ? "—" : averageRating.toFixed(2)}
            <span className="text-sm font-normal text-fg-subtle"> / 5</span>
          </>,
        )}
        <span className="mt-0.5 flex items-center gap-1 text-xs text-fg-subtle">
          <ArrowDownWideNarrow className="size-3" aria-hidden />
          Click to sort by top rated
        </span>
      </button>
    </section>
  );
}
