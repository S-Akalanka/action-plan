// GET  /api/teams/[teamId]/tasks
// POST /api/teams/[teamId]/tasks

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

  const tasks = await prisma.task.findMany({
    where: { teamId },
    orderBy: { category: "asc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const allowed = await canAccessTeam(session.user.id, teamId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { category, description, kpiReference, frequency, source } = body;

  const task = await prisma.task.create({
    data: {
      teamId,
      createdById: session.user.id,
      category,
      description,
      kpiReference: kpiReference ?? null,
      frequency,
      source: source ?? "ADHOC",
    },
  });

  // Auto-create this week's instance in the same request
  const instance = await prisma.taskInstance.create({
    data: {
      taskId: task.id,
      weekStartDate: getCurrentWeekStart(),
    },
  });

  return NextResponse.json({ ...task, firstInstanceId: instance.id }, { status: 201 });
}
