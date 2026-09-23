import type {
  Category,
  Product,
  ProductInput,
  ProductsResponse,
  SortField,
  SortOrder,
} from "@/types/product";
import { api } from "./api";

export { login } from "./authService";

export interface PageOptions {
  limit: number;
  skip: number;
  sortBy?: SortField | null;
  order?: SortOrder;
}

export interface ProductQuery {
  page: number;
  limit: number;
  q: string;
  category: string | null;
  sortBy: SortField | null;
  order: SortOrder;
}

/** DummyJSON ignores `order` without `sortBy`, so only send the pair together. */
function toQueryParams({ limit, skip, sortBy, order }: PageOptions) {
  return sortBy ? { limit, skip, sortBy, order } : { limit, skip };
}

export async function getProducts(options: PageOptions, signal?: AbortSignal) {
  const { data } = await api.get<ProductsResponse>("/products", {
    params: toQueryParams(options),
    signal,
  });
  return data;
}

export async function searchProducts(
  { q, ...options }: PageOptions & { q: string },
  signal?: AbortSignal,
) {
  const { data } = await api.get<ProductsResponse>("/products/search", {
    params: { q, ...toQueryParams(options) },
    signal,
  });
  return data;
}

export async function getCategories(signal?: AbortSignal) {
  const { data } = await api.get<Category[]>("/products/categories", { signal });
  return data;
}

export async function getProductsByCategory(
  category: string,
  options: PageOptions,
  signal?: AbortSignal,
) {
  const { data } = await api.get<ProductsResponse>(
    `/products/category/${encodeURIComponent(category)}`,
    { params: toQueryParams(options), signal },
  );
  return data;
}

export async function getProductById(id: number, signal?: AbortSignal) {
  const { data } = await api.get<Product>(`/products/${id}`, { signal });
  return data;
}

export async function addProduct(input: ProductInput) {
  const { data } = await api.post<Product>("/products/add", input);
  return data;
}

export async function updateProduct(id: number, input: Partial<ProductInput>) {
  const { data } = await api.put<Product>(`/products/${id}`, input);
  return data;
}

export async function deleteProduct(id: number) {
  const { data } = await api.delete<Product>(`/products/${id}`);
  return data;
}

/**
 * Picks the right endpoint for the current table state. DummyJSON cannot search
 * and filter by category at once, so search takes precedence over category.
 */
export function listProducts(query: ProductQuery, signal?: AbortSignal) {
  const { page, limit, q, category, sortBy, order } = query;
  const options: PageOptions = { limit, skip: (page - 1) * limit, sortBy, order };

  if (q) return searchProducts({ q, ...options }, signal);
  if (category) return getProductsByCategory(category, options, signal);
  return getProducts(options, signal);
}
