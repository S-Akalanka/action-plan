"use client";

import { useState } from "react";
import { WeekSelector } from "@/components/ui/week-selector";
import { KpiCard } from "@/components/executive-summary/kpi-card";
import { TeamSummaryCard } from "@/components/executive-summary/team-summary-card";
import { EXEC_SUMMARY_CARDS, TEAMS, TEAM_SUMMARIES } from "@/lib/mock-data";

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Executive Summary – Overview page (/executive-summary)
 * Shows aggregate KPI cards + a summary card for every team, for a
 * selected week (defaults to current week).
 *
 * NOTE: EXEC_SUMMARY_CARDS / TEAM_SUMMARIES are currently static mock data
 * with no week dimension. Once wired to a real API, GET /api/dashboard
 * should accept the selected week and return that week's numbers —
 * see the change note below where selectedWeek would be used in a real fetch.
 */
export default function ExecutiveSummaryPage() {
  const [selectedWeek, setSelectedWeek] = useState(() => getMonday(new Date()));

  // TODO once connected to a real API: refetch EXEC_SUMMARY_CARDS / TEAM_SUMMARIES
  // for `selectedWeek` here (e.g. via useEffect + fetch, or a data hook).
  // Mock data below doesn't change with the week yet.

  return (
    <main className="flex-1 px-8 py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Executive Summary</h1>
          <p className="mt-1 text-sm text-[#5B6472]">
            Company-wide performance aggregation
          </p>
        </div>
        <WeekSelector weekStart={selectedWeek} onChange={setSelectedWeek} />
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {EXEC_SUMMARY_CARDS.map((card) => (
          <KpiCard key={card.id} card={card} />
        ))}
      </div>

      <div className="space-y-4">
        {TEAMS.map((team) => {
          const summary = TEAM_SUMMARIES.find((s) => s.teamId === team.id);
          if (!summary) return null;
          return <TeamSummaryCard key={team.id} team={team} summary={summary} />;
        })}
      </div>
    </main>
  );
}
