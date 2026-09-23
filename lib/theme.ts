import { createStore } from "./createStore";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "mb_theme";
export const DARK_QUERY = "(prefers-color-scheme: dark)";

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export const themeStore = createStore<ThemePreference>({
  load() {
    if (typeof window === "undefined") return "system";
    const saved = localStorage.getItem(STORAGE_KEY);
    return isThemePreference(saved) ? saved : "system";
  },
  save(preference) {
    localStorage.setItem(STORAGE_KEY, preference);
  },
});

/** Resolves "system" against the OS setting and toggles the `.dark` class. */
export function applyTheme(preference: ThemePreference) {
  const isDark =
    preference === "dark" || (preference === "system" && matchMedia(DARK_QUERY).matches);
  document.documentElement.classList.toggle("dark", isDark);
}

/**
 * Inlined into <head> so the theme class is set before first paint — without it,
 * dark-mode users would see a white flash while React hydrates.
 */
export const themeInitScript = `(() => {
  try {
    const saved = localStorage.getItem("${STORAGE_KEY}");
    const dark = saved === "dark" || (saved !== "light" && matchMedia("${DARK_QUERY}").matches);
    document.documentElement.classList.toggle("dark", dark);
  } catch {}
})();`;
