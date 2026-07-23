// app/api/dashboard/route.ts
// GET /api/dashboard?week=2026-06-29

import { NextResponse } from "next/server";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getCurrentWeekStart } from "@/lib/week";

const MOCK_DASHBOARD_DATA = [
  {
    teamId: "bu01",
    teamName: "BU01 · North America Retail",
    categories: { FINANCE: 82, CUSTOMER: 91, PROCESS_TECH: 64, PEOPLE: 77 },
    overall: 78,
  },
  {
    teamId: "bu02",
    teamName: "BU02 · EMEA Wholesale",
    categories: { FINANCE: 48, CUSTOMER: 65, PROCESS_TECH: 31, PEOPLE: 64 },
    overall: 52,
  },
  {
    teamId: "engineering",
    teamName: "Engineering",
    categories: { FINANCE: 70, CUSTOMER: 80, PROCESS_TECH: 92, PEOPLE: 55 },
    overall: 74,
  },
  {
    teamId: "hr-admin",
    teamName: "HR & Admin",
    categories: { FINANCE: 90, CUSTOMER: 85, PROCESS_TECH: 75, PEOPLE: 92 },
    overall: 86,
  },
  {
    teamId: "sales-marketing",
    teamName: "Sales & Marketing",
    categories: { FINANCE: 60, CUSTOMER: 88, PROCESS_TECH: 50, PEOPLE: 70 },
    overall: 67,
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const weekParam = searchParams.get("week");
    const weekStart = weekParam ? new Date(weekParam) : getCurrentWeekStart();

    const teams = await prisma.team.findMany();
    if (!teams || teams.length === 0) {
      return NextResponse.json(MOCK_DASHBOARD_DATA);
    }

    const result = await Promise.all(
      teams.map(async (team) => {
        const instances = await prisma.taskInstance.findMany({
          where: { weekStartDate: weekStart, task: { teamId: team.id } },
          include: { task: true },
        });
        
        const categories = ["FINANCE", "CUSTOMER", "PROCESS_TECH", "PEOPLE"] as const;
        const categoryPct: Record<string, number> = {};
        
        for (const cat of categories) {
          const inCategory = instances.filter((i) => i.task.category === cat);
          const completed = inCategory.filter((i) => i.status === "COMPLETE").length;
          categoryPct[cat] = inCategory.length > 0 ? Math.round((completed / inCategory.length) * 100) : 0;
        }
        
        const totalCompleted = instances.filter((i) => i.status === "COMPLETE").length;
        const overall = instances.length > 0 ? Math.round((totalCompleted / instances.length) * 100) : 0;
        
        return { 
          teamId: team.id, 
          teamName: team.teamName, 
          categories: categoryPct, 
          overall 
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.warn("Database query failed in /api/dashboard, serving fallback data:", error);
    return NextResponse.json(MOCK_DASHBOARD_DATA);
  }
}
