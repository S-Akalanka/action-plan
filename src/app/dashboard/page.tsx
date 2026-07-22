"use client";

import { useEffect, useState } from "react";
import { WeekSelector } from "@/components/ui/week-selector";
import { KpiCard } from "@/components/executive-summary/kpi-card";
import { TeamSummaryCard } from "@/components/executive-summary/team-summary-card";
import { EXEC_SUMMARY_CARDS, TEAMS } from "@/lib/mock-data";
import type { ExecutiveTeamSummary } from "@/lib/types";

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

export default function ExecutiveSummaryPage() {
  const [selectedWeek, setSelectedWeek] = useState(() => getMonday(new Date()));
  const [teamSummaries, setTeamSummaries] = useState<ExecutiveTeamSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?week=${toDateParam(selectedWeek)}`)
      .then((res) => res.json())
      .then((data) => {
        const mapped: ExecutiveTeamSummary[] = data.map((d: any) => ({
          teamId: d.teamId,
          overall: d.overall,
          status: d.overall >= 80 ? "On Track" : d.overall >= 50 ? "Needs Attention" : "Pending",
          metrics: Object.entries(d.categories).map(([category, percent]) => ({
            category,
            percent,
          })),
        }));
        setTeamSummaries(mapped);
      })
      .finally(() => setLoading(false));
  }, [selectedWeek]);

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
            {EXEC_SUMMARY_CARDS.map((card) => (
              <KpiCard key={card.id} card={card} />
            ))}
          </div>

          <div className="space-y-4">
            {TEAMS.map((team) => {
              const summary = teamSummaries.find((s) => s.teamId === team.id);
              if (!summary) return null;
              return <TeamSummaryCard key={team.id} team={team} summary={summary} />;
            })}
          </div>
        </>
      )}
    </main>
  );
}
