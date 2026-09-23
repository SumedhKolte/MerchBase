"use client";

import { useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SortField, SortOrder } from "@/types/product";

export const PAGE_SIZES = [10, 20, 50] as const;
export type PageSize = (typeof PAGE_SIZES)[number];
export const SORT_FIELDS: readonly SortField[] = ["price", "rating", "title"];

const DEFAULT_LIMIT: PageSize = 10;
const MAX_QUERY_LENGTH = 100;
const CATEGORY_SLUG = /^[a-z0-9-]+$/;

export interface ProductParams {
  page: number;
  limit: PageSize;
  q: string;
  category: string | null;
  sortBy: SortField | null;
  order: SortOrder;
}

interface ReadableParams {
  get(name: string): string | null;
}

/** Turns an untrusted query string into valid table state. Never throws. */
export function parseProductParams(searchParams: ReadableParams): ProductParams {
  const page = Number(searchParams.get("page"));
  const limit = Number(searchParams.get("limit"));
  const q = (searchParams.get("q") ?? "").trim().slice(0, MAX_QUERY_LENGTH);
  const category = searchParams.get("category")?.trim().toLowerCase() ?? "";
  const sortBy = searchParams.get("sortBy") as SortField;

  return {
    page: Number.isSafeInteger(page) && page >= 1 ? page : 1,
    limit: PAGE_SIZES.includes(limit as PageSize) ? (limit as PageSize) : DEFAULT_LIMIT,
    q,
    // Search and category are mutually exclusive in DummyJSON: search wins.
    category: !q && CATEGORY_SLUG.test(category) ? category : null,
    sortBy: SORT_FIELDS.includes(sortBy) ? sortBy : null,
    order: searchParams.get("order") === "desc" ? "desc" : "asc",
  };
}

/** Serializes state back to a query string, omitting defaults for clean, shareable URLs. */
export function serializeProductParams(params: ProductParams): string {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.category) query.set("category", params.category);
  if (params.sortBy) {
    query.set("sortBy", params.sortBy);
    if (params.order === "desc") query.set("order", "desc");
  }
  if (params.page > 1) query.set("page", String(params.page));
  if (params.limit !== DEFAULT_LIMIT) query.set("limit", String(params.limit));
  return query.toString();
}

/**
 * The URL is the single source of truth for table state. This hook reads it,
 * sanitizes it, and exposes intent-level setters that write back to it.
 */
export function useProductParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const params = useMemo(() => parseProductParams(searchParams), [searchParams]);

  const navigate = useCallback(
    (next: ProductParams, { replace = false } = {}) => {
      const query = serializeProductParams(next);
      const url = query ? `${pathname}?${query}` : pathname;
      if (replace) router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [pathname, router],
  );

  // Rewrite malformed URLs (e.g. ?page=abc&limit=9999) to their sanitized form.
  useEffect(() => {
    if (serializeProductParams(params) !== searchParams.toString()) {
      navigate(params, { replace: true });
    }
  }, [params, searchParams, navigate]);

  const setSearch = useCallback(
    // `replace` keeps keystroke-driven updates out of the back-button history.
    (term: string) =>
      navigate({ ...params, q: term.trim(), category: null, page: 1 }, { replace: true }),
    [params, navigate],
  );

  const setCategory = useCallback(
    (category: string | null) => navigate({ ...params, category, q: "", page: 1 }),
    [params, navigate],
  );

  const setPage = useCallback(
    (page: number, options?: { replace?: boolean }) => navigate({ ...params, page }, options),
    [params, navigate],
  );

  const setLimit = useCallback(
    (limit: PageSize) => navigate({ ...params, limit, page: 1 }),
    [params, navigate],
  );

  /** Same field toggles direction; a new field starts ascending; `null` clears sorting. */
  const setSort = useCallback(
    (sortBy: SortField | null, order?: SortOrder) => {
      const toggled = sortBy === params.sortBy && params.order === "asc" ? "desc" : "asc";
      navigate({ ...params, sortBy, order: order ?? toggled, page: 1 });
    },
    [params, navigate],
  );

  const clearFilters = useCallback(
    () => navigate({ ...params, q: "", category: null, page: 1 }),
    [params, navigate],
  );

  return { params, setSearch, setCategory, setPage, setLimit, setSort, clearFilters };
}
