"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useListUrl } from "@/hooks/useListUrl";
import { formatCategory } from "@/lib/format";

const linkClasses =
  "rounded hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Products › Category › Title — the category crumb opens the filtered list. */
export function Breadcrumbs({ category, title }: { category?: string; title?: string }) {
  // "Products" returns to the list exactly as it was left (filters, sort, page).
  const listUrl = useListUrl();

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm text-fg-subtle">
        <li>
          <Link href={listUrl} className={linkClasses}>
            Products
          </Link>
        </li>
        {category && (
          <li className="flex shrink-0 items-center gap-1.5">
            <ChevronRight className="size-3.5" aria-hidden />
            <Link
              href={`/products?category=${encodeURIComponent(category)}`}
              className={linkClasses}
            >
              {formatCategory(category)}
            </Link>
          </li>
        )}
        {title && (
          <li className="flex min-w-0 items-center gap-1.5">
            <ChevronRight className="size-3.5 shrink-0" aria-hidden />
            <span aria-current="page" className="truncate font-medium text-fg">
              {title}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}
