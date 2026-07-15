import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SummaryCardData } from "@/lib/types";

export function KpiCard({ card }: { card: SummaryCardData }) {
  const Icon = card.icon;
  const TrendIcon = card.trend === "up" ? TrendingUp : card.trend === "down" ? TrendingDown : Minus;
  const trendColor =
    card.trend === "up" ? "text-[#16A34A]" : card.trend === "down" ? "text-[#EA580C]" : "text-[#9AA3B2]";

  return (
    <div className="rounded-xl border border-[#E5E9F0] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#DCEBFC] text-[#16233F]">
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-md bg-[#F1F2F5] px-2.5 py-1 text-xs font-medium text-[#5B6472]">
          Avg Overall
        </span>
      </div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#5B6472]">
        {card.label}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-[#16233F]">{card.percent}%</span>
        <span className={cn("flex items-center gap-1 text-sm font-medium", trendColor)}>
          <TrendIcon className="h-4 w-4" />
          {card.delta}
        </span>
      </div>
    </div>
  );
}
