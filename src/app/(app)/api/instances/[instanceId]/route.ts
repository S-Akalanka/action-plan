import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/session";
import { canAccessTeam } from "@/lib/auth";
import { getCurrentWeekStart, normalizeToMonday } from "@/lib/week";
import { patchInstanceSchema } from "@/lib/schemas";

function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const { instanceId } = await params;

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const instance = await prisma.taskInstance.findUnique({
    where: { id: instanceId },
    include: { task: true },
  });

  if (!instance) {
    return NextResponse.json({ error: "Instance not found" }, { status: 404 });
  }

  const allowed = await canAccessTeam(session.user.id, instance.task.teamId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rawBody = await req.json();
  const parseResult = patchInstanceSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid payload", details: parseResult.error.issues }, { status: 400 });
  }

  const body = parseResult.data;
  const currentWeekStart = normalizeToMonday(getCurrentWeekStart());
  const isCurrentWeek =
    toUtcDateKey(instance.weekStartDate) === toUtcDateKey(currentWeekStart);

  if ((body.status !== undefined || body.isActivated !== undefined) && !isCurrentWeek) {
    return NextResponse.json(
      { error: "This week has passed and is read-only." },
      { status: 403 }
    );
  }

  const updateData: Prisma.TaskInstanceUpdateInput = {};

  if (body.status !== undefined) {
    updateData.status = body.status;
    updateData.completedAt = body.status === "COMPLETE" ? new Date() : null;
    updateData.completedBy =
      body.status === "COMPLETE"
        ? { connect: { id: session.user.id } }
        : { disconnect: true };
  }

  if (body.isActivated !== undefined) {
    updateData.isActivated = body.isActivated;
  }

  // Comments are stored directly on the instance.
  const isCommenting = body.comment !== undefined && body.comment.trim().length > 0;
  if (isCommenting) {
    updateData.comment = body.comment!.trim();
    updateData.commentedAt = new Date();
    updateData.commentedBy = { connect: { id: session.user.id } };
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(instance);
  }

  // Excusing a past instance removes it from overdue results and creates the
  // current week's incomplete instance atomically.
  if (isCommenting && !isCurrentWeek) {
    const [updated] = await prisma.$transaction([
      prisma.taskInstance.update({ where: { id: instanceId }, data: updateData }),
      prisma.taskInstance.upsert({
        where: {
          taskId_weekStartDate: {
            taskId: instance.taskId,
            weekStartDate: currentWeekStart,
          },
        },
        create: {
          taskId: instance.taskId,
          weekStartDate: currentWeekStart,
          status: "INCOMPLETE",
        },
        update: {},
      }),
    ]);
    return NextResponse.json(updated);
  }

  const updated = await prisma.taskInstance.update({
    where: { id: instanceId },
    data: updateData,
  });

  return NextResponse.json(updated);
}
