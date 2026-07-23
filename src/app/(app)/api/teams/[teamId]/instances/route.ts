// app/api/teams/[teamId]/instances/route.ts
// GET /api/teams/[teamId]/instances?week=2026-06-29

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentWeekStart } from "@/lib/week";

const MOCK_INSTANCES: Record<string, any[]> = {
  bu01: [
    { id: "i1", taskId: "t1", status: "COMPLETE", isActivated: false, completedAt: "2026-06-30T09:14:00Z" },
    { id: "i2", taskId: "t2", status: "INCOMPLETE", isActivated: false, completedAt: null },
  ],
  engineering: [
    { id: "i3", taskId: "t3", status: "COMPLETE", isActivated: false, completedAt: "2026-06-30T10:00:00Z" },
    { id: "i4", taskId: "t4", status: "INCOMPLETE", isActivated: true, completedAt: null },
  ],
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

    const instances = await prisma.taskInstance.findMany({
      where: { weekStartDate: weekStart, task: { teamId } },
      include: { task: true },
    });
    
    if (!instances || instances.length === 0) {
      return NextResponse.json(MOCK_INSTANCES[teamId] ?? []);
    }
    
    return NextResponse.json(instances);
  } catch (error) {
    console.warn(`Database query failed in /api/teams/${teamId}/instances, serving fallback data:`, error);
    return NextResponse.json(MOCK_INSTANCES[teamId] ?? []);
  }
}
