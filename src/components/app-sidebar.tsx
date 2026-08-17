"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Building2, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeam } from "@/lib/team-context";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { myTeams, loadingTeams, selectedTeamId, setSelectedTeamId } = useTeam();

  const isExecSummary = pathname.startsWith("/dashboard");

  const overviewActive = isExecSummary
    ? pathname === "/dashboard"
    : !selectedTeamId;

  return (
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
        {isExecSummary ? (
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              overviewActive ? "bg-[#DCEBFC] text-[#16233F]" : "text-[#5B6472] hover:bg-[#F5F6F8]"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Overview
          </Link>
        ) : (
          <button
            onClick={() => {
              setSelectedTeamId(null);
              onNavigate?.();
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
              overviewActive ? "bg-[#DCEBFC] text-[#16233F]" : "text-[#5B6472] hover:bg-[#F5F6F8]"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Overview
          </button>
        )}

        {loadingTeams ? (
          <p className="px-3 py-2 text-xs text-[#9AA3B2]">Loading teams…</p>
        ) : (
          myTeams.map((team) => {
            const href = `/dashboard/${team.id}`;
            const active = isExecSummary
              ? pathname === href
              : selectedTeamId === team.id;

            return isExecSummary ? (
              <Link
                key={team.id}
                href={href}
                onClick={onNavigate}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-[#DCEBFC] text-[#16233F]" : "text-[#5B6472] hover:bg-[#F5F6F8]"
                )}
              >
                <Building2 className="h-4 w-4" />
                {team.teamName}
              </Link>
            ) : (
              <button
                key={team.id}
                onClick={() => {
                  setSelectedTeamId(team.id);
                  onNavigate?.();
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  active ? "bg-[#DCEBFC] text-[#16233F]" : "text-[#5B6472] hover:bg-[#F5F6F8]"
                )}
              >
                <Building2 className="h-4 w-4" />
                {team.teamName}
              </button>
            );
          })
        )}
      </nav>
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/") return null;

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#E5E9F0] bg-white px-4 py-6 md:flex">
        <SidebarNav />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "fixed left-4 top-4 z-50 border-[#E5E9F0] bg-white shadow-sm md:hidden"
          )}
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4 text-[#16233F]" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 px-4 py-6">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}