import type { LucideIcon } from "lucide-react";
import { ProgressBar } from "@/components/progress-bar";
import type { CategoryKey } from "@/lib/types";

interface CategoryStat {
  key: CategoryKey;
  icon: LucideIcon;
  done: number;
  total: number;
}

export function SummaryStrip({
  overallPercent,
  categoryStats,
}: {
  overallPercent: number;
  categoryStats: CategoryStat[];
}) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <div className="flex flex-col justify-between rounded-xl bg-[#16233F] p-6 text-white">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
          Overall
        </span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold">{overallPercent}%</span>
          <span className="text-xs text-white/80">this week</span>
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {categoryStats.map((cat) => {
        const Icon = cat.icon;
        const pct = cat.total ? Math.round((cat.done / cat.total) * 100) : 0;
        return (
          <div
            key={cat.key}
            className="rounded-xl border border-[#E5E9F0] bg-white p-6 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#DCEBFC] text-[#16233F]">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-[#5B6472]">
                {cat.key}
              </span>
            </div>
            <div className="mb-3 flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#16233F]">{pct}%</span>
              <span className="text-xs text-[#9AA3B2]">
                {cat.done}/{cat.total}
              </span>
            </div>
            <ProgressBar percent={pct} />
          </div>
        );
      })}
    </div>
  );
}
