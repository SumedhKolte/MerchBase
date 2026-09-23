import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/cn";
import { formatCategory, formatCurrency } from "@/lib/format";
import { isLowStock } from "@/lib/inventory";
import type { SortField, SortOrder } from "@/types/product";
import { ProductActions } from "./ProductActions";
import { MutationBadge, Rating, StockBadge } from "./ProductBadges";
import { ProductThumbnail } from "./ProductThumbnail";
import type { ProductListProps } from "./types";

interface SortState {
  sortBy: SortField | null;
  order: SortOrder;
  onSort: (field: SortField) => void;
}

interface ProductTableProps extends ProductListProps, SortState {
  onToggleSelectAll: () => void;
}

function SortableHeader({
  field,
  label,
  align = "left",
  className,
  sortBy,
  order,
  onSort,
}: SortState & { field: SortField; label: string; align?: "left" | "right"; className?: string }) {
  const isActive = sortBy === field;
  const Icon = !isActive ? ArrowUpDown : order === "asc" ? ArrowUp : ArrowDown;

  return (
    <th
      scope="col"
      aria-sort={isActive ? (order === "asc" ? "ascending" : "descending") : "none"}
      className={cn("px-4 py-3 font-medium", align === "right" && "text-right", className)}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          "inline-flex items-center gap-1 rounded uppercase transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          isActive && "text-fg",
        )}
      >
        {label}
        <Icon className={cn("size-3.5", !isActive && "opacity-40")} aria-hidden />
      </button>
    </th>
  );
}

export function ProductTable({
  products,
  getStatus,
  onEdit,
  onDelete,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  highlightLowStock,
  ...sort
}: ProductTableProps) {
  const allSelected = products.length > 0 && selectedIds.size === products.length;

  return (
    <div className="overflow-x-auto">
      {/* Fixed layout: column widths don't jump as rows change between pages. */}
      <table className="w-full table-fixed text-sm">
        <caption className="sr-only">Products</caption>
        <thead className="border-b border-line bg-surface-muted/60 text-left text-xs tracking-wide text-fg-subtle uppercase">
          <tr>
            <th scope="col" className="w-12 py-3 pl-4">
              <Checkbox
                checked={allSelected}
                indeterminate={selectedIds.size > 0 && !allSelected}
                onChange={onToggleSelectAll}
                aria-label="Select all products on this page"
              />
            </th>
            <th scope="col" className="w-16 py-3 pl-2">
              <span className="sr-only">Image</span>
            </th>
            <SortableHeader field="title" label="Product" {...sort} />
            <th scope="col" className="hidden w-48 px-4 py-3 font-medium 2xl:table-cell">
              Category
            </th>
            <SortableHeader field="price" label="Price" align="right" className="w-28" {...sort} />
            <SortableHeader
              field="rating"
              label="Rating"
              align="right"
              className="hidden w-24 lg:table-cell"
              {...sort}
            />
            <th scope="col" className="w-36 px-4 py-3 text-right font-medium">
              Stock
            </th>
            <th scope="col" className="w-36 px-4 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {products.map((product) => {
            const isSelected = selectedIds.has(product.id);
            const isHighlighted = highlightLowStock && isLowStock(product.stock);
            return (
              <tr
                key={product.id}
                aria-selected={isSelected}
                className={cn(
                  "transition-colors",
                  isSelected
                    ? "bg-accent-soft/60"
                    : isHighlighted
                      ? "bg-amber-50 dark:bg-amber-500/5"
                      : "hover:bg-surface-muted/60",
                )}
              >
                <td className="py-3 pl-4">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onToggleSelect(product.id)}
                    aria-label={`Select ${product.title}`}
                  />
                </td>
                <td className="py-3 pl-2">
                  <ProductThumbnail src={product.thumbnail} alt="" size={40} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="truncate rounded font-medium hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      {product.title}
                    </Link>
                    <MutationBadge status={getStatus(product.id)} />
                  </div>
                  {product.brand && (
                    <p className="truncate text-xs text-fg-subtle">{product.brand}</p>
                  )}
                </td>
                <td className="hidden truncate px-4 py-3 text-fg-muted 2xl:table-cell">
                  {formatCategory(product.category)}
                </td>
                <td className="px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums">
                  {formatCurrency(product.price)}
                </td>
                <td className="hidden px-4 py-3 text-right whitespace-nowrap text-fg-muted lg:table-cell">
                  <Rating value={product.rating} />
                </td>
                <td className="px-4 py-3 text-right">
                  <StockBadge stock={product.stock} />
                </td>
                <td className="px-4 py-3">
                  <ProductActions product={product} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
