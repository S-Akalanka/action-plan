"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import { ClipboardCheck, Eye, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { TEAMS, TEAM_DRILLDOWNS } from "@/lib/mock-data";
import type { InitiativeStatus } from "@/lib/types";

const STATUS_STYLES: Record<InitiativeStatus, string> = {
  Complete: "bg-[#DCFCE7] text-[#16A34A]",
  "In Progress": "bg-[#FEF3C7] text-[#B45309]",
  Pending: "bg-[#F1F2F5] text-[#5B6472]",
};

export default function TeamDrilldownPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = use(params);

  const team = TEAMS.find((t) => t.id === teamId);
  const stats = TEAM_DRILLDOWNS[teamId];

  if (!team || !stats) {
    notFound();
  }

  const inProgressPct = Math.round(
    (stats.inProgress / stats.totalTasks) * 100
  );

  return (
    <main className="flex-1 px-8 py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{team.label} · Team Drill-down</h1>
            <span className="rounded-md bg-[#F1F2F5] px-2 py-1 text-xs font-semibold text-[#5B6472]">
              READ-ONLY
            </span>
          </div>
          <p className="mt-1 text-sm text-[#5B6472]">
            Viewing detailed action plans and status for {team.label}.
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-[#E5E9F0] bg-white px-3 py-2 text-sm font-medium text-[#5B6472]">
          <Eye className="h-4 w-4" />
          CEO View Mode
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Task Stats */}
        <div className="rounded-xl border border-[#E5E9F0] bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-[#16233F]" />
              <h2 className="text-base font-bold">Task Stats</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-[#E5E9F0] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9AA3B2]">
                Total Tasks
              </p>
              <p className="mt-2 text-2xl font-bold">{stats.totalTasks}</p>
              <p className="mt-1 text-xs text-[#9AA3B2]">Across all owners</p>
            </div>
            <div className="rounded-lg border border-[#E5E9F0] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9AA3B2]">
                Completed
              </p>
              <p className="mt-2 text-2xl font-bold text-[#16233F]">{stats.completed}</p>
            </div>
            <div className="rounded-lg border border-[#E5E9F0] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9AA3B2]">
                In Progress
              </p>
              <p className="mt-2 text-2xl font-bold text-[#D97706]">{stats.inProgress}</p>
              <p className="mt-1 text-xs text-[#9AA3B2]">{inProgressPct}% of total</p>
            </div>
            <div className="rounded-lg border border-[#E5E9F0] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9AA3B2]">
                Pending
              </p>
              <p className="mt-2 text-2xl font-bold text-[#5B6472]">{stats.atRisk}</p>
              <p className="mt-1 text-xs text-[#9AA3B2]">Needs attention</p>
            </div>
          </div>
        </div>

        {/* Performance Index */}
        <div className="rounded-xl border border-[#E5E9F0] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold">Performance Index</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{stats.performanceIndex}%</span>
            <span className="text-sm text-[#9AA3B2]">
              Target: {stats.performanceTarget}%
            </span>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#E5E9F0]">
            <div
              className="h-full rounded-full bg-[#16233F]"
              style={{ width: `${stats.performanceIndex}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-[#E5E9F0] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9AA3B2]">
                Tasks Done
              </p>
              <p className="mt-1 text-xl font-bold">{stats.completed}</p>
            </div>
            <div className="rounded-lg border border-[#E5E9F0] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9AA3B2]">
                Team Size
              </p>
              <p className="mt-1 text-xl font-bold">{stats.teamSize}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Plan Breakdown */}
      <div className="mt-8 overflow-hidden rounded-xl border border-[#E5E9F0] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E5E9F0] px-6 py-4">
          <h2 className="text-base font-bold">Action Plan Breakdown</h2>
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#9AA3B2]">
            <Filter className="h-3.5 w-3.5" />
            Filter (disabled)
          </span>
        </div>

        <div className="hidden grid-cols-[1fr_160px_160px_160px_130px] gap-4 border-b border-[#E5E9F0] bg-[#F9FAFB] px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#9AA3B2] md:grid">
          <span>Initiative</span>
          <span>Owner</span>
          <span>Frequency</span>
          <span>KPI Reference</span>
          <span className="text-right">Status</span>
        </div>

        <div className="divide-y divide-[#E5E9F0]">
          {stats.initiatives.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-[1fr_160px_160px_160px_130px] md:items-center md:gap-4"
            >
              <div>
                <p className="text-sm font-medium text-[#16233F]">{item.title}</p>
                <p className="text-xs text-[#9AA3B2]">{item.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#16233F] text-[11px] font-bold text-white">
                  {item.ownerInitials}
                </div>
                <span className="text-sm text-[#5B6472]">{item.ownerName}</span>
              </div>
              <span className="text-sm text-[#5B6472]">{item.frequency}</span>
              <span className="text-sm text-[#5B6472]">{item.kpi}</span>
              <div className="md:text-right">
                <span
                  className={cn(
                    "inline-block rounded-md px-2 py-1 text-xs font-semibold",
                    STATUS_STYLES[item.status]
                  )}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
