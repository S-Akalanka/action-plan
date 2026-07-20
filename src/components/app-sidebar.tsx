"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { TEAMS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useTeam } from "@/lib/team-context";

/**
 * Unified sidebar shown on all pages except the main dashboard (/).
 *
 * Behaviour by section:
 * - /dashboard  → URL navigation: Overview = /dashboard,
 *                         team = /dashboard/[teamId]
 * - /my-plan            → Context: Overview clears selectedTeamId (shows all tasks),
 *                         team sets selectedTeamId
 * - /manage-tasks          → Context: same pattern as my-plan
 */
export function AppSidebar() {
  const pathname = usePathname();
  const { selectedTeamId, setSelectedTeamId } = useTeam();

  // No sidebar on the main dashboard
  if (pathname === "/") return null;

  const isExecSummary = pathname.startsWith("/dashboard");

  // For exec-summary the active state is driven by the URL
  const overviewActive = isExecSummary
    ? pathname === "/dashboard"
    : !selectedTeamId;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[#E5E9F0] bg-white px-4 py-6 md:flex">
      <div>
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#16233F] text-white">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-[#16233F]">
              Business Units
            </p>
            <p className="text-xs text-[#9AA3B2]">Internal Tooling</p>
          </div>
        </div>

        <nav className="space-y-1">
          {/* ── Overview ── */}
          {isExecSummary ? (
            <Link
              href="/dashboard"
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                overviewActive
                  ? "bg-[#DCEBFC] text-[#16233F]"
                  : "text-[#5B6472] hover:bg-[#F5F6F8]"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Overview
            </Link>
          ) : (
            <button
              onClick={() => setSelectedTeamId(null)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                overviewActive
                  ? "bg-[#DCEBFC] text-[#16233F]"
                  : "text-[#5B6472] hover:bg-[#F5F6F8]"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Overview
            </button>
          )}

          {/* ── Teams ── */}
          {TEAMS.map((team) => {
            const Icon = team.icon;
            const href = `/dashboard/${team.id}`;
            const active = isExecSummary
              ? pathname === href
              : selectedTeamId === team.id;

            return isExecSummary ? (
              <Link
                key={team.id}
                href={href}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#DCEBFC] text-[#16233F]"
                    : "text-[#5B6472] hover:bg-[#F5F6F8]"
                )}
              >
                <Icon className="h-4 w-4" />
                {team.label}
              </Link>
            ) : (
              <button
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  active
                    ? "bg-[#DCEBFC] text-[#16233F]"
                    : "text-[#5B6472] hover:bg-[#F5F6F8]"
                )}
              >
                <Icon className="h-4 w-4" />
                {team.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
