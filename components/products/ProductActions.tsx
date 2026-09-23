import Link from "next/link";
import { ArrowUpRight, Eye, Pencil, Trash2 } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";

export interface ProductActionHandlers {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

interface ProductActionsProps extends ProductActionHandlers {
  product: Product;
  /** "icons": compact row for the table. "pills": labelled buttons for cards. */
  variant?: "icons" | "pills";
}

/** Always visible (not hover-only), so touch and keyboard users can reach them. */
export function ProductActions({
  product,
  onEdit,
  onDelete,
  variant = "icons",
}: ProductActionsProps) {
  const deleteButton = (
    <Button
      variant="ghost-danger"
      size="icon"
      shape={variant === "pills" ? "pill" : "rounded"}
      onClick={() => onDelete(product)}
      aria-label={`Delete ${product.title}`}
      title="Delete"
    >
      <Trash2 className="size-4" aria-hidden />
    </Button>
  );

  if (variant === "pills") {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          shape="pill"
          onClick={() => onEdit(product)}
          aria-label={`Edit ${product.title}`}
          className="flex-1"
        >
          <Pencil className="size-3.5" aria-hidden />
          Edit
        </Button>
        <Link
          href={`/products/${product.id}`}
          aria-label={`View ${product.title}`}
          className={cn(buttonClasses("primary", "sm", "pill"), "flex-1")}
        >
          View
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
        {deleteButton}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/products/${product.id}`}
        className={buttonClasses("ghost", "icon")}
        aria-label={`View ${product.title}`}
        title="View"
      >
        <Eye className="size-4" aria-hidden />
      </Link>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(product)}
        aria-label={`Edit ${product.title}`}
        title="Edit"
      >
        <Pencil className="size-4" aria-hidden />
      </Button>
      {deleteButton}
    </div>
  );
}
