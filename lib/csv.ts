import type { Product } from "@/types/product";

const COLUMNS: Array<[header: string, value: (product: Product) => string | number]> = [
  ["ID", (p) => p.id],
  ["Title", (p) => p.title],
  ["Brand", (p) => p.brand ?? ""],
  ["Category", (p) => p.category],
  ["Price (USD)", (p) => p.price.toFixed(2)],
  ["Discount %", (p) => p.discountPercentage ?? ""],
  ["Rating", (p) => p.rating],
  ["Stock", (p) => p.stock],
  ["SKU", (p) => p.sku ?? ""],
];

/**
 * Quotes every cell (RFC 4180) and neutralizes spreadsheet formula injection:
 * a cell starting with = + - @ would otherwise execute when opened in Excel.
 */
function toCell(value: string | number): string {
  const text = String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function productsToCsv(products: Product[]): string {
  const header = COLUMNS.map(([name]) => toCell(name)).join(",");
  const rows = products.map((product) =>
    COLUMNS.map(([, value]) => toCell(value(product))).join(","),
  );
  return [header, ...rows].join("\r\n");
}

/** Triggers a client-side download without any server round trip. */
export function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  // Revoke on the next tick so the browser has started reading the blob.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
