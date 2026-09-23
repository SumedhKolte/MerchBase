export type PageItem = number | "ellipsis-start" | "ellipsis-end";

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

/**
 * Builds a fixed-width page list so the control never shifts while paging:
 *   current=5 of 20 → [1, …, 4, 5, 6, …, 20]
 *   current=2 of 20 → [1, 2, 3, 4, 5, …, 20]
 * The first and last pages are always visible; `siblings` pages flank the current one.
 * Ellipses get distinct names so they can double as React keys.
 */
export function getPageItems(current: number, totalPages: number, siblings = 1): PageItem[] {
  // first + last + current + siblings on both sides + two ellipses
  const slots = 2 * siblings + 5;
  if (totalPages <= slots) return range(1, totalPages);

  const edgeSpan = slots - 2; // pages shown next to a single ellipsis
  if (current <= edgeSpan - siblings) {
    return [...range(1, edgeSpan), "ellipsis-end", totalPages];
  }
  if (current >= totalPages - edgeSpan + siblings + 1) {
    return [1, "ellipsis-start", ...range(totalPages - edgeSpan + 1, totalPages)];
  }
  return [
    1,
    "ellipsis-start",
    ...range(current - siblings, current + siblings),
    "ellipsis-end",
    totalPages,
  ];
}
