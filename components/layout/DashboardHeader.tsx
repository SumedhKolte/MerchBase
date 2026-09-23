"use client";

import Link from "next/link";
import { Boxes, LogOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { useProductOverlay } from "@/context/ProductOverlayContext";
import { useToast } from "@/context/ToastContext";
import { ThemeToggle } from "./ThemeToggle";

export function DashboardHeader() {
  const { user, isLoading, logout } = useAuth();
  const { changeCount, resetOverlay } = useProductOverlay();
  const showToast = useToast();
  const hasChanges = changeCount > 0;

  const handleReset = () => {
    resetOverlay();
    showToast("Demo changes reset — showing live API data");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[88rem] items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/products"
          className="flex items-center gap-2.5 rounded-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-accent-fg shadow-sm">
            <Boxes className="size-4" aria-hidden />
          </span>
          MerchBase
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            size="sm"
            variant={hasChanges ? "attention" : "secondary"}
            onClick={handleReset}
            disabled={!hasChanges}
            aria-label={`Reset demo changes (${changeCount} pending)`}
            title="Discard local changes and show pure API data"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Reset demo changes</span>
            {hasChanges && (
              <span className="rounded-full bg-amber-500 px-1.5 text-xs font-semibold text-white tabular-nums dark:text-amber-950">
                {changeCount}
              </span>
            )}
          </Button>

          <ThemeToggle />

          <div className="mx-1 h-6 w-px bg-line" aria-hidden />

          {isLoading ? (
            <Skeleton className="size-8 rounded-full" />
          ) : (
            user && (
              <div className="flex items-center gap-2">
                <span
                  className="relative flex size-8 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent ring-1 ring-line"
                  aria-hidden
                >
                  {user.firstName[0]}
                  {user.lastName[0]}
                  <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
                </span>
                <span className="hidden text-sm leading-tight md:block">
                  <span className="block font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="block text-xs text-fg-subtle">@{user.username}</span>
                </span>
              </div>
            )
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </header>
  );
}
