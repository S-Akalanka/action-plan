// GET /api/dashboard/[teamId]?week=2026-06-29

import { NextResponse } from "next/server";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessTeam } from "@/lib/auth";
import { getCurrentWeekStart } from "@/lib/week";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const allowed = await canAccessTeam(session.user.id, teamId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const weekParam = searchParams.get("week");
  const weekStart = weekParam ? new Date(weekParam) : getCurrentWeekStart();

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

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
      status: i.status, // read-only view — frontend must disable the toggle
    })),
  });
}
