/** Stock rules shared by badges, metrics, and highlighting. */
export const LOW_STOCK_THRESHOLD = 10;

export type StockLevel = "critical" | "low" | "healthy";

export function getStockLevel(stock: number): StockLevel {
  if (stock <= 5) return "critical";
  if (stock <= 15) return "low";
  return "healthy";
}

export function isLowStock(stock: number): boolean {
  return stock <= LOW_STOCK_THRESHOLD;
}
