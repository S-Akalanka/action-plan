"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WeekSelector } from "@/components/ui/week-selector";
import { KpiCard } from "@/components/executive-summary/kpi-card";
import { TeamSummaryCard } from "@/components/executive-summary/team-summary-card";
import type { ExecutiveTeamSummary, CategoryKey } from "@/lib/types";
import { Landmark, Headset, Cog, Users } from "lucide-react";

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

interface ApiTeam {
  teamId: string;
  teamName: string;
  categories: Record<string, number>;
  overall: number;
  taskCount: number;
}

export default function ExecutiveSummaryPage() {
  const [selectedWeek, setSelectedWeek] = useState(() => getMonday(new Date()));
  const weekParam = toDateParam(selectedWeek);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["dashboard", weekParam],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?week=${weekParam}`);
      if (!res.ok) throw new Error("Failed to load dashboard data");
      return res.json();
    },
  });

  const apiTeams: ApiTeam[] = data && Array.isArray(data.teams) ? data.teams : [];
  const aggregates: Record<string, number> = data?.aggregates || {
    FINANCE: 0,
    CUSTOMER: 0,
    PROCESS_TECH: 0,
    PEOPLE: 0,
  };

  const teamSummaries: ExecutiveTeamSummary[] = apiTeams.map((d: ApiTeam) => ({
    teamId: d.teamId,
    overall: d.overall,
    status: d.overall >= 80 ? "On Track" : d.overall >= 50 ? "Needs Attention" : "Pending",
    metrics: Object.entries(d.categories).map(([category, percent]) => ({
      category: category as CategoryKey,
      percent: percent as number,
    })),
  }));

  const kpiCards = [
    { id: "finance", label: "Finance", icon: Landmark, percent: aggregates.FINANCE ?? 0 },
    { id: "customer", label: "Customer", icon: Headset, percent: aggregates.CUSTOMER ?? 0 },
    { id: "process-tech", label: "Process/Tech", icon: Cog, percent: aggregates.PROCESS_TECH ?? 0 },
    { id: "people", label: "People", icon: Users, percent: aggregates.PEOPLE ?? 0 },
  ];

  return (
    <main className="flex-1 px-8 py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-[#5B6472]">
            Company-wide performance aggregation
          </p>
        </div>
        <WeekSelector weekStart={selectedWeek} onChange={setSelectedWeek} />
      </div>

      {loading ? (
        <p className="text-sm text-[#5B6472]">Loading…</p>
      ) : (
        <>
          <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {kpiCards.map((card) => (
              <KpiCard key={card.id} card={card} />
            ))}
          </div>

          <div className="space-y-4">
            {apiTeams.map((apiTeam) => {
              const summary = teamSummaries.find((s) => s.teamId === apiTeam.teamId);
              if (!summary) return null;
              const team = {
                id: apiTeam.teamId,
                label: apiTeam.teamName,
              };
              return <TeamSummaryCard key={apiTeam.teamId} team={team} summary={summary} />;
            })}
          </div>
        </>
      )}
    </main>
  );
}

