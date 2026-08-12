// app/api/teams/[teamId]/instances/route.ts
// GET /api/teams/[teamId]/instances?week=2026-06-29

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/session";
import { canAccessTeam } from "@/lib/auth";
import { getCurrentWeekStart } from "@/lib/week";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const allowed = await canAccessTeam(session.user.id, teamId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const weekParam = searchParams.get("week");
  const weekStart = weekParam ? new Date(weekParam) : getCurrentWeekStart();
  const currentWeekStart = getCurrentWeekStart();
  const isViewingCurrentWeek = weekStart.getTime() === currentWeekStart.getTime();

  const instances = await prisma.taskInstance.findMany({
    where: { weekStartDate: weekStart, task: { teamId } },
  });

  if (!isViewingCurrentWeek) {
    return NextResponse.json(instances);
  }

  const withExcuseFlag = await Promise.all(
    instances.map(async (inst) => {
      const previousWeekStart = new Date(weekStart);
      previousWeekStart.setDate(previousWeekStart.getDate() - 7);

      const prevInstance = await prisma.taskInstance.findUnique({
        where: { taskId_weekStartDate: { taskId: inst.taskId, weekStartDate: previousWeekStart } },
      });

      const needsExcuseForInstanceId =
        prevInstance && prevInstance.status === "INCOMPLETE" && !(prevInstance as any).comment
          ? prevInstance.id
          : null;

      return { ...inst, needsExcuseForInstanceId };
    })
  );

  return NextResponse.json(withExcuseFlag);
}
