import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentWeekStart, normalizeToMonday } from "@/lib/week";
import { generateInstancesForWeek } from "@/lib/generate-instances";

// Parse calendar dates as UTC to match the database date representation.
function parseWeekParam(week: string): Date {
  const [year, month, day] = week.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const weekParam = searchParams.get("week");

    const weekStart = normalizeToMonday(
      weekParam ? parseWeekParam(weekParam) : getCurrentWeekStart()
    );

    const teams = await prisma.team.findMany();
    if (!teams || teams.length === 0) {
      return NextResponse.json({ aggregates: {}, teams: [] });
    }

    // Generate missing instances only for the current week; historical weeks
    // are immutable.
    const currentWeekStart = getCurrentWeekStart();
    const isViewingCurrentWeek = weekStart.getTime() === currentWeekStart.getTime();

    if (isViewingCurrentWeek) {
      await generateInstancesForWeek(weekStart);
    }

    const allInstances = await prisma.taskInstance.findMany({
      where: { weekStartDate: weekStart },
      include: { task: true },
    });

    const categories = ["FINANCE", "CUSTOMER", "PROCESS_TECH", "PEOPLE"] as const;
    const globalCategoryPct: Record<string, number> = {};
    for (const cat of categories) {
      const inCategory = allInstances.filter((i) => i.task.category === cat);
      const completed = inCategory.filter((i) => i.status === "COMPLETE").length;
      globalCategoryPct[cat] = inCategory.length > 0 ? Math.round((completed / inCategory.length) * 100) : 0;
    }

    const teamResults = teams.map((team) => {
      const instances = allInstances.filter((i) => i.task.teamId === team.id);

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
        overall,
        taskCount: instances.length,
      };
    });

    return NextResponse.json({
      aggregates: globalCategoryPct,
      teams: teamResults,
    });
  } catch (error) {
    console.error("Database query failed in /api/dashboard:", error);
    return NextResponse.json({ aggregates: {}, teams: [] }, { status: 500 });
  }
}