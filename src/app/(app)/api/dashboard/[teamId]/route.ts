// app/api/dashboard/[teamId]/route.ts
// GET /api/dashboard/[teamId]?week=2026-06-29

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentWeekStart, isTaskDueForWeek } from "@/lib/week";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  try {
    const { searchParams } = new URL(req.url);
    const weekParam = searchParams.get("week");
    const weekStart = weekParam ? new Date(weekParam) : getCurrentWeekStart();

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return NextResponse.json({ teamId, teamName: teamId, overall: 0, tasks: [] });
    }

    // Ensure instances exist for active tasks due this week
    const activeTasks = await prisma.task.findMany({
      where: { teamId, isActive: true },
    });

    const tasksNeedingInstances: string[] = [];
    for (const task of activeTasks) {
      if (isTaskDueForWeek(task.frequency, weekStart)) {
        tasksNeedingInstances.push(task.id);
      }
    }

    if (tasksNeedingInstances.length > 0) {
      await prisma.taskInstance.createMany({
        data: tasksNeedingInstances.map((tId) => ({
          taskId: tId,
          weekStartDate: weekStart,
        })),
        skipDuplicates: true,
      });
    }

    // Fetch instances with task + creator data
    const instances = await prisma.taskInstance.findMany({
      where: { weekStartDate: weekStart, task: { teamId } },
      include: {
        task: {
          include: {
            createdBy: true,
          },
        },
      },
    });

    const completed = instances.filter((i) => i.status === "COMPLETE").length;
    const overall = instances.length > 0 ? Math.round((completed / instances.length) * 100) : 0;

    return NextResponse.json({
      teamId: team.id,
      teamName: team.teamName,
      overall,
      tasks: instances.map((i) => ({
        taskId: i.task.id,
        description: i.task.description,
        category: i.task.category,
        frequency: i.task.frequency,
        kpiReference: i.task.kpiReference,
        status: i.status,
        isActivated: i.isActivated,
        createdBy: i.task.createdBy
          ? {
              id: i.task.createdBy.id,
              name: i.task.createdBy.name,
              role: i.task.createdBy.role,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error(`Database query failed in /api/dashboard/${teamId}:`, error);
    return NextResponse.json({ teamId, teamName: teamId, overall: 0, tasks: [] }, { status: 500 });
  }
}
