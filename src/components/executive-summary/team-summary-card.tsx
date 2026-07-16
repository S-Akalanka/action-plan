import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProgressBar } from "@/components/progress-bar";
import type { ExecutiveTeamSummary, Team } from "@/lib/types";

export function TeamSummaryCard({
  team,
  summary,
}: {
  team: Team;
  summary: ExecutiveTeamSummary;
}) {
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-[#E5E9F0] bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="shrink-0 lg:w-56">
        <p className="text-lg font-bold text-[#16233F]">{team.label}</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-3xl font-bold text-[#16233F]">{summary.overall}%</span>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.metrics.map((metric) => (
          <div key={metric.category}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-[#5B6472]">{metric.category}</span>
              <span className="font-semibold text-[#16233F]">{metric.percent}%</span>
            </div>
            <ProgressBar percent={metric.percent} severity={metric.severity} />
          </div>
        ))}
      </div>

      <Link
        href={`/executive-summary/${team.id}`}
        className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#16233F] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0F1A30]"
      >
        View Details
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
