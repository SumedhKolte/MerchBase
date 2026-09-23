import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCategory } from "@/lib/format";

interface EmptyStateProps {
  q: string;
  category: string | null;
  onClearFilters: () => void;
}

export function EmptyState({ q, category, onClearFilters }: EmptyStateProps) {
  const hasFilters = Boolean(q || category);

  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-surface-muted text-fg-subtle ring-1 ring-line">
        <SearchX className="size-6" aria-hidden />
      </span>
      <h2 className="font-semibold">No products found</h2>
      <p className="mt-1 max-w-sm text-sm text-fg-muted">
        {q
          ? `Nothing matches “${q}”. Try a different term or check the spelling.`
          : category
            ? `There are no products in ${formatCategory(category)}.`
            : "There are no products to show yet."}
      </p>
      {hasFilters && (
        <Button className="mt-5" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
