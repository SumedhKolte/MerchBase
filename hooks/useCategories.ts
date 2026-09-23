"use client";

import { useEffect, useState } from "react";
import { isAbortError } from "@/services/api";
import { getCategories } from "@/services/productService";
import type { Category } from "@/types/product";

/** Loads the category list once per mount. Non-critical: on failure the filter stays empty. */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    getCategories(controller.signal)
      .then(setCategories)
      .catch((error: unknown) => {
        if (!isAbortError(error)) console.warn("Failed to load categories", error);
      });
    return () => controller.abort();
  }, []);

  return categories;
}
