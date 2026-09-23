import { Download, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BulkActionBarProps {
  count: number;
  onExport: () => void;
  onDelete: () => void;
  onClear: () => void;
}

/** Floating dock shown while rows are selected. */
export function BulkActionBar({ count, onExport, onDelete, onClear }: BulkActionBarProps) {
  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center gap-2 rounded-xl border border-line bg-surface/95 p-2 pl-4 shadow-2xl backdrop-blur-xl motion-safe:animate-[bulk-bar-in_200ms_ease-out]"
    >
      <p className="mr-auto text-sm font-medium tabular-nums" aria-live="polite">
        {count} selected
      </p>
      <Button size="sm" onClick={onExport}>
        <Download className="size-3.5" aria-hidden />
        <span className="sr-only sm:not-sr-only">Export</span>
      </Button>
      <Button size="sm" variant="danger" onClick={onDelete}>
        <Trash2 className="size-3.5" aria-hidden />
        Delete
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onClear}
        aria-label="Clear selection"
        title="Clear selection"
      >
        <X className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
