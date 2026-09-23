import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { PAGE_SIZES, type PageSize } from "@/hooks/useProductParams";
import { formatNumber } from "@/lib/format";
import { getPageItems } from "@/lib/pagination";

interface PaginationProps {
  page: number;
  limit: PageSize;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: PageSize) => void;
}

export function Pagination({ page, limit, total, onPageChange, onLimitChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const first = Math.min((page - 1) * limit + 1, total);
  const last = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center justify-between gap-4 text-sm text-fg-muted sm:justify-start">
        <p aria-live="polite" className="tabular-nums">
          Showing{" "}
          <span className="font-medium text-fg">
            {formatNumber(first)}–{formatNumber(last)}
          </span>{" "}
          of <span className="font-medium text-fg">{formatNumber(total)}</span>
        </p>
        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap">Rows</span>
          <Select
            size="sm"
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value) as PageSize)}
            wrapperClassName="w-18"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-1 sm:justify-end">
        <Button
          size="sm"
          shape="pill"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" aria-hidden />
          <span className="hidden lg:inline">Previous</span>
        </Button>

        <ol className="hidden items-center gap-1 sm:flex">
          {getPageItems(page, totalPages).map((item) =>
            typeof item === "number" ? (
              <li key={item}>
                <Button
                  size="icon"
                  shape="pill"
                  variant={item === page ? "primary" : "ghost"}
                  onClick={() => onPageChange(item)}
                  aria-current={item === page ? "page" : undefined}
                  aria-label={`Page ${item}`}
                  className="text-sm tabular-nums"
                >
                  {item}
                </Button>
              </li>
            ) : (
              <li key={item} aria-hidden className="w-8 text-center text-fg-subtle">
                …
              </li>
            ),
          )}
        </ol>

        <span className="text-sm text-fg-muted tabular-nums sm:hidden">
          Page {page} of {totalPages}
        </span>

        <Button
          size="sm"
          shape="pill"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <span className="hidden lg:inline">Next</span>
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
