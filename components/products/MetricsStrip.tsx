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

/** How many low-stock products to name in the card before summarizing. */
const LOW_STOCK_PREVIEW = 2;

function summarize(products: Product[]) {
  const rated = products.filter((product) => product.rating > 0);
  const levels: Record<StockLevel, number> = { healthy: 0, low: 0, critical: 0 };
  products.forEach((product) => levels[getStockLevel(product.stock)]++);
  return {
    levels,
    lowStock: products
      .filter((product) => isLowStock(product.stock))
      .sort((a, b) => a.stock - b.stock),
    averageRating: rated.length
      ? rated.reduce((sum, product) => sum + product.rating, 0) / rated.length
      : null,
  };
}

function describeLowStock(lowStock: Product[]) {
  if (lowStock.length === 0) return "Everything on this page is well stocked";
  const named = lowStock
    .slice(0, LOW_STOCK_PREVIEW)
    .map((product) => `${product.title} (${product.stock})`);
  const remaining = lowStock.length - LOW_STOCK_PREVIEW;
  return [...named, ...(remaining > 0 ? [`+${remaining} more`] : [])].join(" · ");
}

// flex-col: <button> cards would otherwise vertically center their content.
// On phones each card is 80% wide in a swipeable row; from `sm` they share a grid.
const cardClasses =
  "flex min-h-36 w-4/5 shrink-0 snap-start flex-col rounded-2xl border bg-surface p-4 text-left shadow-xs transition sm:w-auto";
const interactiveClasses =
  "hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:hover:translate-y-0";

const CHIP_TONES = {
  accent: "bg-accent-soft text-accent",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
};

function CardHeader({
  label,
  icon: Icon,
  tone,
}: {
  label: string;
  icon: typeof Star;
  tone: keyof typeof CHIP_TONES;
}) {
  return (
    <span className="flex items-center gap-2.5 text-sm font-medium text-fg-muted">
      <span className={cn("flex size-7 items-center justify-center rounded-lg", CHIP_TONES[tone])}>
        <Icon className="size-4" aria-hidden />
      </span>
      {label}
    </span>
  );
}

/**
 * Five stars filled proportionally to the rating (e.g. 3.8 → 76%): an amber row
 * clipped to that width over a gray row. `fill-current` must sit on each icon,
 * because Lucide's own fill="none" attribute would beat an inherited fill.
 */
function StarMeter({ rating }: { rating: number }) {
  const stars = [1, 2, 3, 4, 5].map((star) => (
    <Star key={star} className="size-4 shrink-0 fill-current" aria-hidden />
  ));
  return (
    <span className="relative inline-flex" role="img" aria-label={`${rating.toFixed(2)} out of 5`}>
      <span className="flex text-line">{stars}</span>
      <span
        className="absolute inset-y-0 left-0 flex overflow-hidden text-amber-400"
        style={{ width: `${(rating / 5) * 100}%` }}
      >
        {stars}
      </span>
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
      <Skeleton className="mt-3 h-9 w-20" />
    ) : (
      <span className={cn("mt-3 block text-3xl font-semibold tabular-nums", className)}>
        {content}
      </span>
    );

  return (
    // Phones: a snap-scrolling row, so the product list isn't pushed below the fold.
    <section
      aria-label="Summary metrics"
      className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0"
    >
      {/* Inventory health: a segmented bar of the loaded rows' stock levels. */}
      <div className={cn(cardClasses, "border-line")}>
        <CardHeader label="Inventory health" icon={PackageSearch} tone="accent" />
        {value(
          <>
            {formatNumber(total)}{" "}
            <span className="text-sm font-normal text-fg-subtle">
              {catalogTotal === null ? "" : `of ${formatNumber(catalogTotal)}`}
            </span>
          </>,
        )}
        <div className="mt-auto pt-3">
          <div
            className="flex h-1.5 overflow-hidden rounded-full bg-surface-muted"
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
      </div>

      {/* Low stock: names the most urgent items; click toggles row highlighting. */}
      <button
        type="button"
        onClick={onToggleLowStock}
        aria-pressed={isLowStockHighlighted}
        disabled={isLoading}
        autoComplete="off"
        className={cn(
          cardClasses,
          interactiveClasses,
          isLowStockHighlighted
            ? "border-amber-400 ring-1 ring-amber-400 dark:border-amber-500/60 dark:ring-amber-500/60"
            : "border-line",
        )}
      >
        <CardHeader label="Low stock alerts" icon={AlertTriangle} tone="amber" />
        {value(
          <>
            {formatNumber(lowStock.length)}{" "}
            <span className="text-sm font-normal text-fg-subtle">
              stock ≤ {LOW_STOCK_THRESHOLD}
            </span>
          </>,
          lowStock.length > 0 ? "text-amber-600 dark:text-amber-400" : undefined,
        )}
        <span className="mt-auto block pt-3 text-xs">
          <span className="block truncate text-fg-subtle">
            {isLoading ? " " : describeLowStock(lowStock)}
          </span>
          <span className="mt-1 block font-medium text-fg-muted">
            {isLowStockHighlighted
              ? "Highlighting rows · click to clear"
              : "Click to highlight rows"}
          </span>
        </span>
      </button>

      {/* Rating: one click to sort the table best-first. */}
      <button
        type="button"
        onClick={onSortByRating}
        disabled={isLoading}
        autoComplete="off"
        className={cn(cardClasses, interactiveClasses, "border-line")}
      >
        <CardHeader label="Average rating" icon={Star} tone="amber" />
        {value(
          <>
            {averageRating === null ? "—" : averageRating.toFixed(2)}
            <span className="text-sm font-normal text-fg-subtle"> / 5</span>
          </>,
        )}
        <span className="mt-auto flex items-center justify-between gap-2 pt-3">
          {averageRating !== null && !isLoading && <StarMeter rating={averageRating} />}
          <span className="ml-auto flex items-center gap-1 text-xs font-medium text-fg-muted">
            <ArrowDownWideNarrow className="size-3.5" aria-hidden />
            Sort by top rated
          </span>
        </span>
      </button>
    </section>
  );
}
