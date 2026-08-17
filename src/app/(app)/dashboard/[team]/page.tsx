"use client";

import { notFound } from "next/navigation";
import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, Eye, Filter } from "lucide-react";
import { WeekSelector } from "@/components/ui/week-selector";
import type { TeamDrilldownStats } from "@/lib/types";

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toDateParam(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function TeamDrilldownPage({
  params,
}: {
  params: Promise<{ team: string }>;
}) {
  const { team } = use(params);
  const [selectedWeek, setSelectedWeek] = useState(() => getMonday(new Date()));
  const weekParam = toDateParam(selectedWeek);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["dashboard-team", team, weekParam],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/${team}?week=${weekParam}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  if (!loading && (!data || !data.teamId)) {
    notFound();
  }

  if (loading || !data || !data.teamId) {
    return (
      <main className="flex-1 px-8 py-8">
        <p className="text-sm text-[#5B6472]">Loading…</p>
      </main>
    );
  }

  const teamName: string = data.teamName;
  const completed = data.tasks.filter(
    (t: any) => t.status === "COMPLETE",
  ).length;
  const incomplete = data.tasks.length - completed;

  const stats: TeamDrilldownStats = {
    teamId: data.teamId,
    totalTasks: data.tasks.length,
    completed,
    incomplete,
    currentlyActive: data.tasks.filter((t: any) => t.isActivated).length,
    completedTrendLabel: "",
    performanceIndex: data.overall,
    initiatives: data.tasks.map((t: any) => {
      const initials = t.createdBy?.name
        ? t.createdBy.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "—";
      return {
        id: t.taskId,
        title: t.description,
        subtitle: t.category,
        ownerInitials: initials,
        ownerName: t.createdBy?.name ?? "—",
        frequency: t.frequency ?? "Weekly",
        kpi: t.kpiReference ?? "—",
        active: t.isActivated ?? false,
        completed: t.status === "COMPLETE",
        comment: t.comment ?? "-",
      };
    }),
  };

  const activePct =
    stats.totalTasks > 0
      ? Math.round((stats.currentlyActive / stats.totalTasks) * 100)
      : 0;

  return (
    <main className="flex-1 px-8 py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{teamName} · Team Drill-down</h1>
            <span className="rounded-md bg-[#F1F2F5] px-2 py-1 text-xs font-semibold text-[#5B6472]">
              READ-ONLY
            </span>
          </div>
          <p className="mt-1 text-sm text-[#5B6472]">
            Viewing detailed action plans and status for {teamName}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <WeekSelector weekStart={selectedWeek} onChange={setSelectedWeek} />
          <button className="flex items-center gap-1.5 rounded-lg border border-[#E5E9F0] bg-white px-3 py-2 text-sm font-medium text-[#5B6472]">
            <Eye className="h-4 w-4" />
            CEO View Mode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[#E5E9F0] bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-[#16233F]" />
            <h2 className="text-base font-bold">Task Stats</h2>
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
                Complete
              </p>
              <p className="mt-2 text-2xl font-bold text-[#16233F]">
                {stats.completed}
              </p>
            </div>
            <div className="rounded-lg border border-[#E5E9F0] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9AA3B2]">
                Incomplete
              </p>
              <p className="mt-2 text-2xl font-bold text-[#5B6472]">
                {stats.incomplete}
              </p>
            </div>
            <div className="rounded-lg border border-[#E5E9F0] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9AA3B2]">
                Currently Active
              </p>
              <p className="mt-2 text-2xl font-bold text-[#D97706]">
                {stats.currentlyActive}
              </p>
              <p className="mt-1 text-xs text-[#9AA3B2]">
                {activePct}% of total
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E9F0] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold">Performance Index</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {stats.performanceIndex}%
            </span>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#E5E9F0]">
            <div
              className="h-full rounded-full bg-[#16233F]"
              style={{ width: `${stats.performanceIndex}%` }}
            />
          </div>
          <div className="mt-4 rounded-lg border border-[#E5E9F0] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9AA3B2]">
              Tasks Done
            </p>
            <p className="mt-1 text-xl font-bold">{stats.completed}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-[#E5E9F0] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E5E9F0] px-6 py-4">
          <h2 className="text-base font-bold">Action Plan Breakdown</h2>
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#9AA3B2]">
            <Filter className="h-3.5 w-3.5" />
            Filter (disabled)
          </span>
        </div>

        <div className="hidden grid-cols-[1fr_100px_100px_130px_100px_200px] gap-4 border-b border-[#E5E9F0] bg-[#F9FAFB] px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#9AA3B2] md:grid">
          <span>Initiative</span>
          <span>Owner</span>
          <span>Frequency</span>
          <span>KPI Reference</span>
          <span>Status</span>
          <span>Comments</span>
        </div>

        <div className="divide-y divide-[#E5E9F0]">
          {stats.initiatives.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-[1fr_100px_100px_140px_100px_200px] md:items-center md:gap-4"
            >
              <div>
                <p className="text-sm font-medium text-[#16233F]">
                  {item.title}
                </p>
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
              <div className="">
                {item.completed ? (
                  <span className="inline-block rounded-md bg-[#DCFCE7] px-2 py-1 text-xs font-semibold text-[#16A34A]">
                    Complete
                  </span>
                ) : item.active ? (
                  <span className="inline-block rounded-md bg-[#FEF3C7] px-2 py-1 text-xs font-semibold text-[#B45309]">
                    In Progress
                  </span>
                ) : (
                  <span className="inline-block rounded-md bg-[#F1F2F5] px-2 py-1 text-xs font-semibold text-[#5B6472]">
                    Incomplete
                  </span>
                )}
              </div>
              <span className="text-xs text-[#5B6472] ">{item.comment}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
