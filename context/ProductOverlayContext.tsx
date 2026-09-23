"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import {
  createDraft,
  EMPTY_OVERLAY,
  getMutationStatus,
  overlayStore,
  type MutationStatus,
  type OverlayState,
} from "@/lib/overlay";
import type { Product, ProductInput } from "@/types/product";

interface ProductOverlayValue extends OverlayState {
  changeCount: number;
  getStatus: (id: number) => MutationStatus;
  addLocal: (input: ProductInput) => Product;
  updateLocal: (id: number, changes: Partial<ProductInput>) => void;
  deleteLocal: (id: number) => void;
  resetOverlay: () => void;
}

const ProductOverlayContext = createContext<ProductOverlayValue | null>(null);

function addLocal(input: ProductInput): Product {
  const draft = createDraft(input, overlayStore.getSnapshot());
  overlayStore.setState((prev) => ({ ...prev, localAdded: [draft, ...prev.localAdded] }));
  return draft;
}

function updateLocal(id: number, changes: Partial<ProductInput>) {
  overlayStore.setState((prev) => {
    const isDraft = prev.localAdded.some((draft) => draft.id === id);
    // Drafts are edited in place; remote products get a patch layered on top.
    return isDraft
      ? {
          ...prev,
          localAdded: prev.localAdded.map((draft) =>
            draft.id === id ? { ...draft, ...changes } : draft,
          ),
        }
      : {
          ...prev,
          localUpdated: { ...prev.localUpdated, [id]: { ...prev.localUpdated[id], ...changes } },
        };
  });
}

function deleteLocal(id: number) {
  overlayStore.setState((prev) => {
    const isDraft = prev.localAdded.some((draft) => draft.id === id);
    if (isDraft) {
      return { ...prev, localAdded: prev.localAdded.filter((draft) => draft.id !== id) };
    }
    const localUpdated = { ...prev.localUpdated };
    delete localUpdated[id];
    return { ...prev, localUpdated, localDeleted: new Set(prev.localDeleted).add(id) };
  });
}

function resetOverlay() {
  overlayStore.setState(EMPTY_OVERLAY);
}

const getServerSnapshot = () => EMPTY_OVERLAY;

export function ProductOverlayProvider({ children }: { children: React.ReactNode }) {
  const overlay = useSyncExternalStore(
    overlayStore.subscribe,
    overlayStore.getSnapshot,
    getServerSnapshot,
  );

  const value = useMemo<ProductOverlayValue>(
    () => ({
      ...overlay,
      changeCount:
        overlay.localAdded.length +
        Object.keys(overlay.localUpdated).length +
        overlay.localDeleted.size,
      getStatus: (id) => getMutationStatus(overlay, id),
      addLocal,
      updateLocal,
      deleteLocal,
      resetOverlay,
    }),
    [overlay],
  );

  return <ProductOverlayContext.Provider value={value}>{children}</ProductOverlayContext.Provider>;
}

export function useProductOverlay() {
  const context = useContext(ProductOverlayContext);
  if (!context) throw new Error("useProductOverlay must be used within <ProductOverlayProvider>");
  return context;
}
