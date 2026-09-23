"use client";

import { useSyncExternalStore } from "react";
import { createStore } from "@/lib/createStore";

export type ViewMode = "table" | "grid";

const STORAGE_KEY = "mb_view";

/**
 * A per-browser display preference, not table state — so it lives in
 * localStorage rather than the URL (shared links shouldn't dictate layout).
 */
const viewModeStore = createStore<ViewMode>({
  load() {
    if (typeof window === "undefined") return "table";
    return localStorage.getItem(STORAGE_KEY) === "grid" ? "grid" : "table";
  },
  save(mode) {
    localStorage.setItem(STORAGE_KEY, mode);
  },
});

const getServerSnapshot = (): ViewMode => "table";

export function useViewMode() {
  const viewMode = useSyncExternalStore(
    viewModeStore.subscribe,
    viewModeStore.getSnapshot,
    getServerSnapshot,
  );
  return { viewMode, setViewMode: viewModeStore.setState };
}
