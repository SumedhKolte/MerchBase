"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { useProductOverlay } from "@/context/ProductOverlayContext";
import { useToast } from "@/context/ToastContext";
import { useCategories } from "@/hooks/useCategories";
import { useHotkey } from "@/hooks/useHotkey";
import { rememberListUrl } from "@/hooks/useListUrl";
import { serializeProductParams, useProductParams } from "@/hooks/useProductParams";
import { useProducts } from "@/hooks/useProducts";
import { useRowSelection } from "@/hooks/useRowSelection";
import { useViewMode } from "@/hooks/useViewMode";
import { cn } from "@/lib/cn";
import { downloadCsv, productsToCsv } from "@/lib/csv";
import { applyOverlay, getMatchingDrafts } from "@/lib/overlay";
import type { Product } from "@/types/product";
import { BulkActionBar } from "./BulkActionBar";
import { CategoryPills, CategoryRail } from "./CategoryNav";
import { DeleteProductModal } from "./DeleteProductModal";
import { EmptyState } from "./EmptyState";
import { MetricsStrip } from "./MetricsStrip";
import { Pagination } from "./Pagination";
import { ProductCardGrid } from "./ProductCardGrid";
import { ProductFormModal } from "./ProductFormModal";
import { ProductsSkeleton } from "./ProductsSkeleton";
import { ProductTable } from "./ProductTable";
import { ProductToolbar } from "./ProductToolbar";
import { ShortcutsDialog } from "./ShortcutsDialog";

export function ProductDashboard() {
  const { params, setSearch, setCategory, setPage, setLimit, setSort, clearFilters } =
    useProductParams();
  const { data, error, isLoading, retry } = useProducts(params);
  const categories = useCategories();
  const overlay = useProductOverlay();
  const showToast = useToast();
  const { viewMode, setViewMode } = useViewMode();

  // "new" opens the add form; a product opens the edit form.
  const [formTarget, setFormTarget] = useState<Product | "new" | null>(null);
  const [deleteTargets, setDeleteTargets] = useState<Product[] | null>(null);
  const [isLowStockHighlighted, setIsLowStockHighlighted] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const listRef = useRef<HTMLElement>(null);

  const products = useMemo(() => {
    if (!data) return [];
    // Drafts are pinned to the top of the first page, like a newly created row.
    const drafts = params.page === 1 ? getMatchingDrafts(overlay, params) : [];
    return [...drafts, ...applyOverlay(data.products, overlay)];
  }, [data, overlay, params]);

  const visibleIds = useMemo(() => products.map((product) => product.id), [products]);
  const selection = useRowSelection(serializeProductParams(params), visibleIds);
  const isFirstLoad = !data && !error;
  const selectedProducts = products.filter((product) => selection.selectedIds.has(product.id));

  // Clamp out-of-range pages (e.g. ?page=999) to the last page that exists.
  // Only on fresh data: while loading, `data` still belongs to the previous query.
  const lastPage = data && !isLoading ? Math.max(1, Math.ceil(data.total / params.limit)) : null;
  useEffect(() => {
    if (lastPage !== null && params.page > lastPage) setPage(lastPage, { replace: true });
  }, [lastPage, params.page, setPage]);

  // Lets "back to products" links on the detail page return to this exact view.
  const listQuery = serializeProductParams(params);
  useEffect(() => rememberListUrl(listQuery), [listQuery]);

  /** Paging from the bottom of a long list should land on the new page's first row. */
  const changePage = (page: number) => {
    setPage(page);
    const list = listRef.current;
    if (!list) return;
    // Scroll when the list's top edge is hidden — above the viewport or under the
    // sticky header. Its scroll-margin (scroll-mt-20) is exactly that clearance.
    const clearance = parseFloat(getComputedStyle(list).scrollMarginTop);
    if (list.getBoundingClientRect().top < clearance) {
      const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
      list.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  useHotkey("n", () => setFormTarget("new"));
  useHotkey("?", () => setIsShortcutsOpen(true));

  const categoryNavProps = {
    categories,
    active: params.category,
    isSearchActive: Boolean(params.q),
    onSelect: setCategory,
  };

  const exportCsv = (rows: Product[], filename: string) => {
    downloadCsv(filename, productsToCsv(rows));
    showToast(`Exported ${rows.length} product${rows.length === 1 ? "" : "s"} to CSV`);
  };

  const renderResults = () => {
    if (error) {
      return <ErrorAlert title="Couldn’t load products" message={error} onRetry={retry} />;
    }
    // Skeleton only when there's nothing to show yet; afterwards the previous rows
    // stay on screen (dimmed) while the next page loads, instead of flashing.
    if (isFirstLoad || (isLoading && products.length === 0)) {
      return <ProductsSkeleton rows={Math.min(params.limit, 10)} viewMode={viewMode} />;
    }
    if (products.length === 0) {
      return <EmptyState q={params.q} category={params.category} onClearFilters={clearFilters} />;
    }
    const listProps = {
      products,
      getStatus: overlay.getStatus,
      onEdit: setFormTarget,
      onDelete: (product: Product) => setDeleteTargets([product]),
      selectedIds: selection.selectedIds,
      onToggleSelect: selection.toggle,
      highlightLowStock: isLowStockHighlighted,
    };
    const showTable = viewMode === "table";
    return (
      <div
        className={cn(
          "transition-opacity duration-200",
          isLoading && "pointer-events-none opacity-50",
        )}
      >
        {showTable && (
          <div className="hidden md:block">
            <ProductTable
              {...listProps}
              onToggleSelectAll={selection.toggleAll}
              sortBy={params.sortBy}
              order={params.order}
              onSort={(field) => setSort(field)}
            />
          </div>
        )}
        {/* Phones always get cards; the desktop grid view reuses the same component. */}
        <div className={cn(showTable && "md:hidden")}>
          <ProductCardGrid {...listProps} />
        </div>
      </div>
    );
  };

  return (
    // Extra bottom padding keeps the floating bulk bar from covering pagination.
    <div className={cn("space-y-6", selection.selectedIds.size > 0 && "pb-20")}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-accent uppercase">Catalog</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Products</h1>
          <p className="mt-2 text-sm text-fg-muted">
            Search, filter, and manage your catalog.{" "}
            <button
              type="button"
              onClick={() => setIsShortcutsOpen(true)}
              className="inline-flex items-center gap-1 rounded text-fg-subtle underline-offset-2 hover:text-fg hover:underline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <Keyboard className="size-3.5" aria-hidden />
              Shortcuts <kbd className="font-mono text-xs">?</kbd>
            </button>
          </p>
        </div>
        <Button
          variant="primary"
          shape="pill"
          onClick={() => setFormTarget("new")}
          aria-keyshortcuts="n"
        >
          <Plus className="size-4" aria-hidden />
          Add product
        </Button>
      </header>

      <MetricsStrip
        products={products}
        catalogTotal={data?.total ?? null}
        isLoading={isFirstLoad}
        isLowStockHighlighted={isLowStockHighlighted}
        onToggleLowStock={() => setIsLowStockHighlighted((on) => !on)}
        onSortByRating={() => setSort("rating", "desc")}
      />

      {/* Rail beside the list from xl; below that, category pills above it. */}
      <div className="xl:grid xl:grid-cols-[14rem_minmax(0,1fr)] xl:gap-6">
        <CategoryRail {...categoryNavProps} />
        <div className="min-w-0 space-y-4">
          <CategoryPills {...categoryNavProps} />
          <section
            ref={listRef}
            aria-label="Product list"
            aria-busy={isLoading}
            className="relative scroll-mt-20 overflow-hidden rounded-2xl border border-line bg-surface shadow-xs"
          >
            {isLoading && !isFirstLoad && (
              <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden" aria-hidden>
                <div className="h-full w-2/5 bg-accent motion-safe:animate-[progress-slide_1s_ease-in-out_infinite]" />
              </div>
            )}
            <ProductToolbar
              q={params.q}
              sortBy={params.sortBy}
              order={params.order}
              viewMode={viewMode}
              canExport={products.length > 0 && !isLoading}
              onSearch={setSearch}
              onSortChange={setSort}
              onViewModeChange={setViewMode}
              onExport={() => exportCsv(products, `merchbase-products-page-${params.page}.csv`)}
            />
            {renderResults()}
            {data && data.total > 0 && !error && (
              <Pagination
                page={params.page}
                limit={params.limit}
                total={data.total}
                onPageChange={changePage}
                onLimitChange={setLimit}
              />
            )}
          </section>
        </div>
      </div>

      {selection.selectedIds.size > 0 && (
        <BulkActionBar
          count={selection.selectedIds.size}
          onExport={() => exportCsv(selectedProducts, "merchbase-selected-products.csv")}
          onDelete={() => setDeleteTargets(selectedProducts)}
          onClear={selection.clear}
        />
      )}

      {formTarget && (
        <ProductFormModal
          product={formTarget === "new" ? null : formTarget}
          categories={categories}
          onClose={() => setFormTarget(null)}
        />
      )}
      {deleteTargets && (
        <DeleteProductModal products={deleteTargets} onClose={() => setDeleteTargets(null)} />
      )}
      {isShortcutsOpen && <ShortcutsDialog onClose={() => setIsShortcutsOpen(false)} />}
    </div>
  );
}
