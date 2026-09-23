import { Download, Info, LayoutGrid, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { ViewMode } from "@/hooks/useViewMode";
import { cn } from "@/lib/cn";
import type { SortField, SortOrder } from "@/types/product";
import { SearchInput } from "./SearchInput";

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "Default order" },
  { value: "title-asc", label: "Title: A → Z" },
  { value: "title-desc", label: "Title: Z → A" },
  { value: "price-asc", label: "Price: low → high" },
  { value: "price-desc", label: "Price: high → low" },
  { value: "rating-desc", label: "Rating: high → low" },
  { value: "rating-asc", label: "Rating: low → high" },
];

const VIEW_OPTIONS: Array<{ mode: ViewMode; label: string; icon: typeof Rows3 }> = [
  { mode: "table", label: "Table view", icon: Rows3 },
  { mode: "grid", label: "Grid view", icon: LayoutGrid },
];

interface ProductToolbarProps {
  q: string;
  sortBy: SortField | null;
  order: SortOrder;
  viewMode: ViewMode;
  canExport: boolean;
  onSearch: (term: string) => void;
  onSortChange: (sortBy: SortField | null, order?: SortOrder) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onExport: () => void;
}

export function ProductToolbar({
  q,
  sortBy,
  order,
  viewMode,
  canExport,
  onSearch,
  onSortChange,
  onViewModeChange,
  onExport,
}: ProductToolbarProps) {
  return (
    <div className="space-y-3 border-b border-line p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput value={q} onSearch={onSearch} />
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 md:w-48 md:flex-none">
            <label htmlFor="sort-order" className="sr-only">
              Sort products
            </label>
            <Select
              id="sort-order"
              value={sortBy ? `${sortBy}-${order}` : ""}
              onChange={(event) => {
                const [field, direction] = event.target.value.split("-");
                onSortChange((field as SortField) || null, direction as SortOrder);
              }}
            >
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          {/* Phones always get cards, so the layout switch only appears from md up. */}
          <div
            role="group"
            aria-label="Layout"
            className="hidden h-10 rounded-lg border border-line-strong bg-surface-muted p-1 md:flex"
          >
            {VIEW_OPTIONS.map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => onViewModeChange(mode)}
                aria-pressed={viewMode === mode}
                aria-label={label}
                title={label}
                className={cn(
                  "flex w-8 items-center justify-center rounded-md transition focus-visible:outline-2 focus-visible:outline-accent",
                  viewMode === mode
                    ? "bg-surface text-fg shadow-sm"
                    : "text-fg-subtle hover:text-fg",
                )}
              >
                <Icon className="size-4" aria-hidden />
              </button>
            ))}
          </div>
          <Button onClick={onExport} disabled={!canExport} title="Export the loaded rows as CSV">
            <Download className="size-4" aria-hidden />
            <span className="sr-only lg:not-sr-only">Export CSV</span>
          </Button>
        </div>
      </div>

      {q && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-sky-700 dark:text-sky-400">
          <Info className="size-3.5 shrink-0" aria-hidden />
          Global search active — Category filter bypassed
        </p>
      )}
    </div>
  );
}
