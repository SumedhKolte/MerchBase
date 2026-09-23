"use client";

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage, isAbortError } from "@/services/api";
import { listProducts, type ProductQuery } from "@/services/productService";
import type { ProductsResponse } from "@/types/product";

interface FetchResult {
  key: string;
  data: ProductsResponse | null;
  error: string | null;
}

/**
 * Fetches one page of products for the given table state.
 *
 * Race-condition safety: every change of inputs aborts the previous request in
 * the effect cleanup, so a slow, stale response can never overwrite a newer one.
 * Loading is derived (the stored result belongs to an older request key) rather
 * than toggled, which keeps state updates out of the effect body.
 *
 * While a new page loads, the previous page's data is still returned (flagged
 * by `isLoading`), so the UI can dim it instead of flashing a skeleton.
 */
export function useProducts({ page, limit, q, category, sortBy, order }: ProductQuery) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<FetchResult>({ key: "", data: null, error: null });
  const requestKey = JSON.stringify([page, limit, q, category, sortBy, order, attempt]);

  useEffect(() => {
    const controller = new AbortController();

    listProducts({ page, limit, q, category, sortBy, order }, controller.signal)
      .then((data) => setResult({ key: requestKey, data, error: null }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, data: null, error: getErrorMessage(error) });
      });

    return () => controller.abort();
  }, [requestKey, page, limit, q, category, sortBy, order]);

  const isCurrent = result.key === requestKey;
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return {
    data: result.data,
    error: isCurrent ? result.error : null,
    isLoading: !isCurrent,
    retry,
  };
}
