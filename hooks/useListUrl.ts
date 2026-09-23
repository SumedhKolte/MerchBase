"use client";

import { useSyncExternalStore } from "react";
import { createStore } from "@/lib/createStore";

const STORAGE_KEY = "mb_list_url";
const DEFAULT_URL = "/products";

/**
 * The last product-list URL (with its filters, sort, and page), so "back to
 * products" links return people to where they were instead of page 1.
 */
const listUrlStore = createStore<string>({
  load() {
    if (typeof window === "undefined") return DEFAULT_URL;
    const saved = sessionStorage.getItem(STORAGE_KEY);
    // Only same-app list URLs — never follow an arbitrary stored value.
    return saved?.startsWith(DEFAULT_URL) ? saved : DEFAULT_URL;
  },
  save(url) {
    sessionStorage.setItem(STORAGE_KEY, url);
  },
});

const getServerSnapshot = () => DEFAULT_URL;

export function useListUrl() {
  return useSyncExternalStore(listUrlStore.subscribe, listUrlStore.getSnapshot, getServerSnapshot);
}

export function rememberListUrl(query: string) {
  listUrlStore.setState(query ? `${DEFAULT_URL}?${query}` : DEFAULT_URL);
}
