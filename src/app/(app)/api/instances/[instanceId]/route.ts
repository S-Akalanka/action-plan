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

// PATCH /api/instances/[instanceId] — Update instance status, activation, or comment
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const { instanceId } = await params;

  // Verify user authentication
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Fetch instance and related task
  const instance = await prisma.taskInstance.findUnique({
    where: { id: instanceId },
    include: { task: true },
  });

  if (!instance) {
    return NextResponse.json({ error: "Instance not found" }, { status: 404 });
  }

  // Verify user has access to task's team
  const allowed = await canAccessTeam(session.user.id, instance.task.teamId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Validate request body
  const rawBody = await req.json();
  const parseResult = patchInstanceSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid payload", details: parseResult.error.issues }, { status: 400 });
  }

  const body = parseResult.data;
  // Determine if viewing current week
  const currentWeekStart = getCurrentWeekStart();
  const isCurrentWeek =
    toUtcDateKey(instance.weekStartDate) === toUtcDateKey(currentWeekStart);

  // Enforce read-only on past weeks (prevent status/activation changes)
  if ((body.status !== undefined || body.isActivated !== undefined) && !isCurrentWeek) {
    return NextResponse.json(
      { error: "This week has passed and is read-only." },
      { status: 403 }
    );
  }

  // Build update payload
  const updateData: Prisma.TaskInstanceUpdateInput = {};

  // Update status and mark completion metadata if transitioning to COMPLETE
  if (body.status !== undefined) {
    updateData.status = body.status;
    updateData.completedAt = body.status === "COMPLETE" ? new Date() : null;
    updateData.completedById = body.status === "COMPLETE" ? session.user.id : null;
  }

  // Update activation flag
  if (body.isActivated !== undefined) {
    updateData.isActivated = body.isActivated;
  }

  // Update single comment (scalar field on TaskInstance, not a separate row)
  if (body.comment !== undefined && body.comment.trim()) {
    updateData.comment = body.comment.trim();
    updateData.commentedAt = new Date();
    updateData.commentedById = session.user.id;
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
