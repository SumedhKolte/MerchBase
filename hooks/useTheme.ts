"use client";

import { useEffect, useSyncExternalStore } from "react";
import { applyTheme, DARK_QUERY, themeStore, type ThemePreference } from "@/lib/theme";

const getServerSnapshot = (): ThemePreference => "system";

export function useTheme() {
  const preference = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    getServerSnapshot,
  );

  // Keep the <html> class in sync, and follow live OS changes while on "system".
  useEffect(() => {
    applyTheme(preference);
    if (preference !== "system") return;

    const media = matchMedia(DARK_QUERY);
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  return { preference, setPreference: themeStore.setState };
}
