"use client";

import { useCallback, useEffect, useState } from "react";
import { useProductOverlay } from "@/context/ProductOverlayContext";
import { ApiError, getErrorMessage, isAbortError } from "@/services/api";
import { getProductById } from "@/services/productService";
import type { Product } from "@/types/product";

export type ProductState =
  | { status: "loading" }
  | { status: "success"; product: Product }
  | { status: "not-found" }
  | { status: "error"; message: string };

interface FetchResult {
  key: string;
  product: Product | null;
  error: unknown;
}

/** Resolves a product by URL id: local drafts and deletions win over the API. */
export function useProduct(rawId: string) {
  const { localAdded, localUpdated, localDeleted } = useProductOverlay();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<FetchResult>({ key: "", product: null, error: null });

  const id = Number(rawId);
  const isValidId = Number.isSafeInteger(id) && id > 0;
  const draft = localAdded.find((product) => product.id === id);
  const isDeleted = localDeleted.has(id);
  const shouldFetch = isValidId && !draft && !isDeleted;
  const requestKey = `${id}:${attempt}`;

  useEffect(() => {
    if (!shouldFetch) return;
    const controller = new AbortController();

    getProductById(id, controller.signal)
      .then((product) => setResult({ key: requestKey, product, error: null }))
      .catch((error: unknown) => {
        if (!isAbortError(error)) setResult({ key: requestKey, product: null, error });
      });

    return () => controller.abort();
  }, [shouldFetch, id, requestKey]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const state = ((): ProductState => {
    if (!isValidId || isDeleted) return { status: "not-found" };
    if (draft) return { status: "success", product: draft };
    if (result.key !== requestKey) return { status: "loading" };
    if (result.product) {
      return { status: "success", product: { ...result.product, ...localUpdated[id] } };
    }
    if (result.error instanceof ApiError && result.error.status === 404) {
      return { status: "not-found" };
    }
    return { status: "error", message: getErrorMessage(result.error) };
  })();

  return { state, retry };
}
