"use client";

import { useEffect, useState } from "react";
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
  const [teamSummaries, setTeamSummaries] = useState<ExecutiveTeamSummary[]>([]);
  const [apiTeams, setApiTeams] = useState<ApiTeam[]>([]);
  const [aggregates, setAggregates] = useState<Record<string, number>>({ FINANCE: 0, CUSTOMER: 0, PROCESS_TECH: 0, PEOPLE: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?week=${toDateParam(selectedWeek)}`)
      .then((res) => {
        if (!res.ok) return res.json().then((err) => Promise.reject(err));
        return res.json();
      })
      .then((data) => {
        if (!data || !Array.isArray(data.teams)) {
          console.error("Unexpected /api/dashboard response:", data);
          setTeamSummaries([]);
          setApiTeams([]);
          return;
        }

        setAggregates(data.aggregates || { FINANCE: 0, CUSTOMER: 0, PROCESS_TECH: 0, PEOPLE: 0 });
        setApiTeams(data.teams);

        const mapped: ExecutiveTeamSummary[] = data.teams.map((d: ApiTeam) => ({
          teamId: d.teamId,
          overall: d.overall,
          status: d.overall >= 80 ? "On Track" : d.overall >= 50 ? "Needs Attention" : "Pending",
          metrics: Object.entries(d.categories).map(([category, percent]) => ({
            category: category as CategoryKey,
            percent: percent as number,
          })),
        }));
        setTeamSummaries(mapped);
      })
      .catch((err) => {
        console.error("Failed to load dashboard:", err);
        setTeamSummaries([]);
        setApiTeams([]);
      })
      .finally(() => setLoading(false));
  }, [selectedWeek]);

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
              // Build a team object compatible with TeamSummaryCard
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
