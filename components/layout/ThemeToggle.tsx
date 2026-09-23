"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import type { ThemePreference } from "@/lib/theme";

const THEMES: Record<ThemePreference, { label: string; icon: typeof Sun; next: ThemePreference }> =
  {
    system: { label: "System", icon: Monitor, next: "light" },
    light: { label: "Light", icon: Sun, next: "dark" },
    dark: { label: "Dark", icon: Moon, next: "system" },
  };

/** One button that cycles System → Light → Dark. */
export function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  const { label, icon: Icon, next } = THEMES[preference];
  const hint = `Theme: ${label}. Switch to ${THEMES[next].label}.`;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setPreference(next)}
      aria-label={hint}
      title={hint}
    >
      <Icon className="size-4" aria-hidden />
    </Button>
  );
}
