// app/api/teams/[teamId]/instances/route.ts
// GET /api/teams/[teamId]/instances?week=2026-06-29
//
// Now accepts a week param, matching the Dashboard routes' pattern —
// needed so My Plan can view past weeks (and their comments) via its
// own week selector.

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

  const instances = await prisma.taskInstance.findMany({
    where: { weekStartDate: weekStart, task: { teamId } },
  });

  return NextResponse.json(instances);
}
