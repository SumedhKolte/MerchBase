"use client";

import { useMemo } from "react";
import { useProductOverlay } from "@/context/ProductOverlayContext";
import { addProduct, deleteProduct, updateProduct } from "@/services/productService";
import type { ProductInput } from "@/types/product";

/**
 * Sends each mutation to DummyJSON (which validates but never persists it), then
 * records it in the local overlay. Drafts only exist locally, so the API is
 * skipped for them — it would answer 404.
 */
export function useProductMutations() {
  const { addLocal, updateLocal, deleteLocal, getStatus } = useProductOverlay();

  return useMemo(
    () => ({
      async createProduct(input: ProductInput) {
        await addProduct(input);
        return addLocal(input);
      },
      async editProduct(id: number, input: ProductInput) {
        if (getStatus(id) !== "draft") await updateProduct(id, input);
        updateLocal(id, input);
      },
      async removeProduct(id: number) {
        if (getStatus(id) !== "draft") await deleteProduct(id);
        deleteLocal(id);
      },
    }),
    [addLocal, updateLocal, deleteLocal, getStatus],
  );
}
