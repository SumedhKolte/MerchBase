import { Star } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { formatNumber } from "@/lib/format";
import { getStockLevel, type StockLevel } from "@/lib/inventory";
import type { MutationStatus } from "@/lib/overlay";

const STOCK_STYLES: Record<StockLevel, { tone: BadgeTone; dot: string }> = {
  critical: { tone: "danger", dot: "bg-red-500" },
  low: { tone: "warning", dot: "bg-amber-500" },
  healthy: { tone: "success", dot: "bg-emerald-500" },
};

export function StockBadge({ stock }: { stock: number }) {
  const { tone, dot } = STOCK_STYLES[getStockLevel(stock)];
  return (
    <Badge tone={tone} className="tabular-nums">
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
      {stock === 0 ? "Out of stock" : `${formatNumber(stock)} in stock`}
    </Badge>
  );
}

export function MutationBadge({ status }: { status: MutationStatus }) {
  if (status === "draft") return <Badge tone="info">Draft</Badge>;
  if (status === "modified") return <Badge tone="accent">Locally modified</Badge>;
  return null;
}

export function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 tabular-nums">
      <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
      <span>{value > 0 ? value.toFixed(2) : "—"}</span>
      <span className="sr-only">out of 5</span>
    </span>
  );
}
