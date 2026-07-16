import { KpiCard } from "@/components/executive-summary/kpi-card";
import { TeamSummaryCard } from "@/components/executive-summary/team-summary-card";
import { EXEC_SUMMARY_CARDS, TEAMS, TEAM_SUMMARIES } from "@/lib/mock-data";

/**
 * Executive Summary – Overview page (/executive-summary)
 * Shows aggregate KPI cards + a summary card for every team.
 * Individual teams are explored via the sidebar links → /executive-summary/[teamId]
 */
export default function ExecutiveSummaryPage() {
  return (
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
        {TEAMS.map((team) => {
          const summary = TEAM_SUMMARIES.find((s) => s.teamId === team.id);
          if (!summary) return null;
          return <TeamSummaryCard key={team.id} team={team} summary={summary} />;
        })}
      </div>
    </main>
  );
}
