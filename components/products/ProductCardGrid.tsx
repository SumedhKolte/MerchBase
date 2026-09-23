import Link from "next/link";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/cn";
import { formatCategory, formatCurrency } from "@/lib/format";
import { isLowStock } from "@/lib/inventory";
import { ProductActions } from "./ProductActions";
import { MutationBadge, Rating, StockBadge } from "./ProductBadges";
import { ProductThumbnail } from "./ProductThumbnail";
import type { ProductListProps } from "./types";

const MAX_TAGS = 3;
/** The first grid row (up to 4 cards) is above the fold. */
const EAGER_IMAGE_COUNT = 4;

/**
 * Card presentation: compact rows on phones (image left), "pedestal" cards from
 * `sm` up (image staged on top). Used for mobile and for the desktop grid view.
 */
export function ProductCardGrid({
  products,
  getStatus,
  onEdit,
  onDelete,
  selectedIds,
  onToggleSelect,
  highlightLowStock,
}: ProductListProps) {
  return (
    <ul className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
      {products.map((product, index) => {
        const isSelected = selectedIds.has(product.id);
        const isHighlighted = highlightLowStock && isLowStock(product.stock);
        const discount = Math.round(product.discountPercentage ?? 0);

        return (
          <li
            key={product.id}
            className={cn(
              "group flex min-w-0 flex-col gap-3 rounded-2xl border bg-surface p-3 transition hover:-translate-y-0.5 hover:shadow-lg motion-reduce:hover:translate-y-0",
              isSelected
                ? "border-accent ring-1 ring-accent"
                : isHighlighted
                  ? "border-amber-400 dark:border-amber-500/60"
                  : "border-line hover:border-line-strong",
            )}
          >
            <div className="flex min-w-0 flex-1 gap-3 sm:flex-col">
              <div className="relative shrink-0">
                <ProductThumbnail
                  src={product.thumbnail}
                  alt=""
                  variant="stage"
                  eager={index < EAGER_IMAGE_COUNT}
                  className="size-20 sm:aspect-square sm:size-auto sm:w-full"
                />
                <Checkbox
                  checked={isSelected}
                  onChange={() => onToggleSelect(product.id)}
                  aria-label={`Select ${product.title}`}
                  className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3"
                />
                {/* Hidden on the small phone thumbnail, where it would cover the image. */}
                {discount > 0 && (
                  <span className="absolute top-3 right-3 hidden rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white tabular-nums sm:block">
                    −{discount}%
                  </span>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:px-1">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium tracking-widest text-fg-subtle uppercase">
                    {formatCategory(product.category)}
                    {product.brand && ` · ${product.brand}`}
                  </p>
                  <Link
                    href={`/products/${product.id}`}
                    className="line-clamp-2 rounded font-semibold hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    {product.title}
                  </Link>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-lg font-semibold tabular-nums">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-sm text-fg-muted">
                    <Rating value={product.rating} />
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <StockBadge stock={product.stock} />
                  <MutationBadge status={getStatus(product.id)} />
                  {product.tags.slice(0, MAX_TAGS).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-fg-muted"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <ProductActions product={product} onEdit={onEdit} onDelete={onDelete} variant="pills" />
          </li>
        );
      })}
    </ul>
  );
}
