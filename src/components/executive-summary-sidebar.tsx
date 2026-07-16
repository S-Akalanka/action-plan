"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { TEAMS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function ExecutiveSummarySidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-[#E5E9F0] bg-white px-4 py-6 md:flex">
      <div>
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#16233F] text-white">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-[#16233F]">
              Executive View
            </p>
            <p className="text-xs text-[#9AA3B2]">Internal Tooling</p>
          </div>
        </div>

        <nav className="space-y-1">
          {/* Overview link */}
          <Link
            href="/executive-summary"
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === "/executive-summary"
                ? "bg-[#DCEBFC] text-[#16233F]"
                : "text-[#5B6472] hover:bg-[#F5F6F8]"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Overview
          </Link>

          {/* Per-team links */}
          {TEAMS.map((team) => {
            const Icon = team.icon;
            const href = `/executive-summary/${team.id}`;
            const active = pathname === href;
            return (
              <Link
                key={team.id}
                href={href}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  active
                    ? "bg-[#DCEBFC] text-[#16233F]"
                    : "text-[#5B6472] hover:bg-[#F5F6F8]"
                )}
              >
                <Icon className="h-4 w-4" />
                {team.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
