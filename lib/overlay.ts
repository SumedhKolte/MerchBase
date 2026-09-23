import type { Product, ProductInput } from "@/types/product";
import { createStore } from "./createStore";

/**
 * DummyJSON accepts writes but never persists them, so mutations live in this
 * client-side overlay and are layered over every API response.
 */
export interface OverlayState {
  localAdded: Product[];
  localUpdated: Record<number, Partial<Product>>;
  localDeleted: Set<number>;
}

export type MutationStatus = "draft" | "modified" | null;

export const EMPTY_OVERLAY: OverlayState = {
  localAdded: [],
  localUpdated: {},
  localDeleted: new Set(),
};

/** Drafts get ids far above DummyJSON's range so they never collide with remote ids. */
const DRAFT_ID_START = 1_000_000;
const STORAGE_KEY = "mb_overlay";

export const overlayStore = createStore<OverlayState>({
  load() {
    if (typeof window === "undefined") return EMPTY_OVERLAY;
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
      return saved
        ? { ...saved, localDeleted: new Set<number>(saved.localDeleted) }
        : EMPTY_OVERLAY;
    } catch {
      return EMPTY_OVERLAY;
    }
  },
  save(state) {
    // A Set doesn't survive JSON.stringify, so persist it as an array.
    const serializable = { ...state, localDeleted: [...state.localDeleted] };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  },
});

export function createDraft(input: ProductInput, overlay: OverlayState): Product {
  const id = Math.max(DRAFT_ID_START, ...overlay.localAdded.map((p) => p.id + 1));
  return { id, ...input, rating: 0, tags: [], thumbnail: "", images: [], reviews: [] };
}

/** Removes locally deleted products and applies local edits to remote results. */
export function applyOverlay(products: Product[], overlay: OverlayState): Product[] {
  return products
    .filter((product) => !overlay.localDeleted.has(product.id))
    .map((product) => ({ ...product, ...overlay.localUpdated[product.id] }));
}

/** Drafts that match the active search or category, so filters behave consistently. */
export function getMatchingDrafts(
  overlay: OverlayState,
  { q, category }: { q: string; category: string | null },
): Product[] {
  const term = q.toLowerCase();
  return overlay.localAdded.filter(
    (draft) =>
      (!category || draft.category === category) &&
      (!term || draft.title.toLowerCase().includes(term)),
  );
}

export function getMutationStatus(overlay: OverlayState, id: number): MutationStatus {
  if (overlay.localAdded.some((draft) => draft.id === id)) return "draft";
  if (id in overlay.localUpdated) return "modified";
  return null;
}
