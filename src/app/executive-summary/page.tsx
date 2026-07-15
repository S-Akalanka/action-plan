"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { TeamSidebar } from "@/components/team-sidebar";
import { KpiCard } from "@/components/executive-summary/kpi-card";
import { TeamSummaryCard } from "@/components/executive-summary/team-summary-card";
import { EXEC_SUMMARY_CARDS, TEAMS, TEAM_SUMMARIES } from "@/lib/mock-data";

export default function ExecutiveSummaryPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const teamsToShow = selectedTeamId ? TEAMS.filter((t) => t.id === selectedTeamId) : TEAMS;

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#16233F]">
      <SiteHeader />

      <div className="mx-auto flex max-w-[1400px]">
        <TeamSidebar selectedTeamId={selectedTeamId} onSelect={setSelectedTeamId} />

        <main className="flex-1 px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Executive Summary</h1>
            <p className="mt-1 text-sm text-[#5B6472]">
              Company-wide performance aggregation
            </p>
          </div>

          <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {EXEC_SUMMARY_CARDS.map((card) => (
              <KpiCard key={card.id} card={card} />
            ))}
          </div>

          <div className="space-y-4">
            {teamsToShow.map((team) => {
              const summary = TEAM_SUMMARIES.find((s) => s.teamId === team.id);
              if (!summary) return null;
              return <TeamSummaryCard key={team.id} team={team} summary={summary} />;
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
