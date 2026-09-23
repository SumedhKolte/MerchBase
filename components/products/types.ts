import type { MutationStatus } from "@/lib/overlay";
import type { Product } from "@/types/product";
import type { ProductActionHandlers } from "./ProductActions";

/** Props shared by the table and card-grid presentations of the product list. */
export interface ProductListProps extends ProductActionHandlers {
  products: Product[];
  getStatus: (id: number) => MutationStatus;
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  /** Emphasize rows with stock ≤ LOW_STOCK_THRESHOLD (toggled from the metrics strip). */
  highlightLowStock: boolean;
}
