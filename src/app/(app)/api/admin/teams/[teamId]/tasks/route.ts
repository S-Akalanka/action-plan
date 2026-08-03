// app/api/admin/teams/[teamId]/tasks/route.ts
// GET  /api/admin/teams/[teamId]/tasks
// POST /api/admin/teams/[teamId]/tasks
//
// GET now also supports teamId = "all" for the Overview view — returns
// every team's standard tasks with their assigned team name attached,
// so Manage Tasks can show an "Assigned Team" column instead of the
// removed Active/Inactive toggle.

import { NextResponse } from "next/server";
import { Category, Frequency as PrismaFrequency } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/session";
import { requireAdminOrCeo } from "@/lib/auth";
import { getCurrentWeekStart } from "@/lib/week";

const CATEGORY_TO_ENUM: Record<string, Category> = {
  Finance: "FINANCE",
  Customer: "CUSTOMER",
  "Process/Tech": "PROCESS_TECH",
  People: "PEOPLE",
};

const FREQUENCY_TO_ENUM: Record<string, PrismaFrequency> = {
  Weekly: "WEEKLY",
  "Bi-weekly": "BI_WEEKLY",
  Monthly: "MONTHLY",
  Quarterly: "QUARTERLY",
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  const tasks = await prisma.task.findMany({
    where: teamId === "all" ? { source: "STANDARD" } : { teamId, source: "STANDARD" },
    orderBy: { createdAt: "desc" },
    include: {
      team: { select: { teamName: true } },
    },
  });

  const withTeamName = tasks.map((t) => ({
    ...t,
    teamName: t.team.teamName,
    team: undefined,
  }));

  return NextResponse.json(withTeamName);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const isAdminOrCeo = await requireAdminOrCeo(session.user.id);
  if (!isAdminOrCeo) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  const body = await req.json();
  const { category, description, kpiReference, frequency } = body;

  const task = await prisma.task.create({
    data: {
      teamId,
      createdById: session.user.id,
      category: CATEGORY_TO_ENUM[category] ?? (category as Category),
      description,
      kpiReference: kpiReference ?? null,
      frequency: FREQUENCY_TO_ENUM[frequency] ?? (frequency as PrismaFrequency),
      source: "STANDARD",
    },
    include: { team: { select: { teamName: true } } },
  });

  const instance = await prisma.taskInstance.create({
    data: {
      taskId: task.id,
      weekStartDate: getCurrentWeekStart(),
    },
  });

  return NextResponse.json(
    { ...task, taskId: task.id, teamName: task.team.teamName, firstInstanceId: instance.id },
    { status: 201 }
  );
}
