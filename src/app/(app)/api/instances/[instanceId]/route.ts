import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/session";
import { canAccessTeam } from "@/lib/auth";
import { getCurrentWeekStart } from "@/lib/week";
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
  const currentWeekStart = getCurrentWeekStart();
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
    updateData.completedById = body.status === "COMPLETE" ? session.user.id : null;
  }

  if (body.isActivated !== undefined) {
    updateData.isActivated = body.isActivated;
  }

  // `comment` is not a scalar column on TaskInstance — comments live in a
  // separate Comment model (see /api/instances/[instanceId]/comments).
  // A submitted excuse/comment becomes a new Comment row rather than an
  // update to a field that doesn't exist.
  if (body.comment !== undefined && body.comment.trim()) {
    await prisma.comment.create({
      data: {
        taskInstanceId: instanceId,
        authorId: session.user.id,
        body: body.comment.trim(),
      },
    });
  }

  const updated =
    Object.keys(updateData).length > 0
      ? await prisma.taskInstance.update({
          where: { id: instanceId },
          data: updateData,
        })
      : instance;

  return NextResponse.json(updated);
}
