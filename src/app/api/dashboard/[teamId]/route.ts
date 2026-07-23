// app/api/dashboard/[teamId]/route.ts
// GET /api/dashboard/[teamId]?week=2026-06-29

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentWeekStart } from "@/lib/week";

const MOCK_DRILLDOWNS: Record<string, any> = {
  engineering: {
    teamId: "engineering",
    teamName: "Engineering",
    overall: 81,
    tasks: [
      {
        taskId: "t1",
        description: "Fix critical auth bug in staging",
        category: "PROCESS_TECH",
        frequency: "Weekly",
        kpiReference: "Bug Resolution SLA",
        status: "COMPLETE",
        isActivated: false,
      },
      {
        taskId: "t2",
        description: "Clear code review backlog",
        category: "PROCESS_TECH",
        frequency: "Weekly",
        kpiReference: "Review Turnaround",
        status: "INCOMPLETE",
        isActivated: true,
      },
    ],
  },
  bu01: {
    teamId: "bu01",
    teamName: "BU01 · North America Retail",
    overall: 78,
    tasks: [
      {
        taskId: "t3",
        description: "Reconcile weekly cash position",
        category: "FINANCE",
        frequency: "Weekly",
        kpiReference: "Ledger Accuracy %",
        status: "COMPLETE",
        isActivated: false,
      },
      {
        taskId: "t4",
        description: "Review top-10 customer health scores",
        category: "CUSTOMER",
        frequency: "Weekly",
        kpiReference: "NPS",
        status: "INCOMPLETE",
        isActivated: false,
      },
    ],
  },
};

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
      const fallback = MOCK_DRILLDOWNS[teamId] ?? { teamId, teamName: teamId, overall: 0, tasks: [] };
      return NextResponse.json(fallback);
    }

    const instances = await prisma.taskInstance.findMany({
      where: { weekStartDate: weekStart, task: { teamId } },
      include: { task: true },
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
      })),
    });
  } catch (error) {
    console.warn(`Database query failed in /api/dashboard/${teamId}, serving fallback data:`, error);
    const fallback = MOCK_DRILLDOWNS[teamId] ?? { teamId, teamName: teamId, overall: 0, tasks: [] };
    return NextResponse.json(fallback);
  }
}
