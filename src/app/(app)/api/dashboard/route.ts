import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentWeekStart, isTaskDueForWeek } from "@/lib/week";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const weekParam = searchParams.get("week");
    const weekStart = weekParam ? new Date(weekParam) : getCurrentWeekStart();

    const teams = await prisma.team.findMany();
    if (!teams || teams.length === 0) {
      return NextResponse.json({ aggregates: {}, teams: [] });
    }

    const activeTasks = await prisma.task.findMany({
      where: { isActive: true },
    });

    const tasksNeedingInstances: string[] = [];
    for (const task of activeTasks) {
      if (isTaskDueForWeek(task.frequency, weekStart, task.deadline)) {
        tasksNeedingInstances.push(task.id);
      }
    }

    if (tasksNeedingInstances.length > 0) {
      await prisma.taskInstance.createMany({
        data: tasksNeedingInstances.map((taskId) => ({
          taskId,
          weekStartDate: weekStart,
        })),
        skipDuplicates: true,
      });
    }


    // Now fetch all instances for this week (including freshly created ones)
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
