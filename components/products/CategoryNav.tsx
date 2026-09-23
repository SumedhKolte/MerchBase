"use client";

import { useEffect, useRef } from "react";
import { Info } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import type { Category } from "@/types/product";

interface CategoryNavProps {
  categories: Category[];
  /** The URL's category slug; `null` means all products. */
  active: string | null;
  /** Search bypasses categories in DummyJSON, so nothing is highlighted while searching. */
  isSearchActive: boolean;
  onSelect: (slug: string | null) => void;
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function toNavItems({ categories, active, isSearchActive }: CategoryNavProps) {
  return [
    { slug: null, name: "All products" },
    ...categories.map(({ slug, name }) => ({ slug, name })),
  ].map((item) => ({ ...item, isActive: !isSearchActive && item.slug === active }));
}

/** Sticky left rail for wide screens (xl+). */
export function CategoryRail(props: CategoryNavProps) {
  const items = toNavItems(props);
  const isLoading = props.categories.length === 0;

  return (
    <nav
      aria-label="Categories"
      className="sticky top-20 hidden max-h-[calc(100dvh-6rem)] self-start overflow-y-auto pr-1 [scrollbar-color:var(--line)_transparent] [scrollbar-width:thin] xl:block"
    >
      <p className="mb-2 px-3 text-xs font-medium tracking-widest text-fg-subtle uppercase">
        Categories
      </p>
      {props.isSearchActive && (
        <p className="mx-3 mb-2 flex items-start gap-1.5 text-xs text-sky-700 dark:text-sky-400">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Searching all categories
        </p>
      )}
      <ul className="space-y-0.5">
        {items.map(({ slug, name, isActive }) => (
          <li key={slug ?? "all"}>
            <button
              type="button"
              onClick={() => props.onSelect(slug)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                focusRing,
                isActive
                  ? "bg-accent-soft font-medium text-accent"
                  : "text-fg-muted hover:bg-surface-muted hover:text-fg",
              )}
            >
              {name}
            </button>
          </li>
        ))}
        {isLoading &&
          Array.from({ length: 8 }, (_, i) => (
            <li key={i} className="px-3 py-2">
              <Skeleton className="h-3.5 w-3/4" />
            </li>
          ))}
      </ul>
    </nav>
  );
}

/** Horizontally scrollable pills for narrower screens (< xl). */
export function CategoryPills(props: CategoryNavProps) {
  const items = toNavItems(props);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Keep the active pill in view, e.g. after landing on ?category=… deep in the list.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [props.active, props.categories.length]);

  return (
    <nav aria-label="Categories" className="-mx-4 xl:hidden sm:mx-0">
      {/* Edge fade on phones hints that the strip scrolls sideways. */}
      <ul className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] max-sm:[mask-image:linear-gradient(to_right,transparent,#000_1rem,#000_calc(100%-1rem),transparent)] sm:px-0">
        {items.map(({ slug, name, isActive }) => (
          <li key={slug ?? "all"} className="shrink-0">
            <button
              ref={isActive ? activeRef : undefined}
              type="button"
              onClick={() => props.onSelect(slug)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap transition-colors",
                focusRing,
                isActive
                  ? "border-accent bg-accent text-accent-fg"
                  : "border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg",
              )}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
