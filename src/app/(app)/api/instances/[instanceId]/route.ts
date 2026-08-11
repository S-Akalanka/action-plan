// app/api/instances/[instanceId]/route.ts
// PATCH /api/instances/[instanceId]
//
// Comment is a single string on TaskInstance, targeting the PREVIOUS
// (frozen) instance specifically — this is how the forced-comment flow
// works: the current week's row shows the input, but it PATCHes the prior
// week's instanceId, not its own. status/isActivated still only apply to
// the current week's own instance (checked via isCurrentWeek below);
// comment is allowed on ANY instance, since it's meant to target past ones.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/session";
import { canAccessTeam } from "@/lib/auth";
import { getCurrentWeekStart } from "@/lib/week";

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

  const body = await req.json();
  const currentWeekStart = getCurrentWeekStart();
  const isCurrentWeek = instance.weekStartDate.getTime() === currentWeekStart.getTime();

  // status / isActivated only ever apply to the CURRENT week's own instance
  // — you can't retroactively mark a past week complete or "in progress".
  if ((body.status !== undefined || body.isActivated !== undefined) && !isCurrentWeek) {
    return NextResponse.json(
      { error: "This week has passed and is read-only." },
      { status: 403 }
    );
  }

  // comment has no such restriction — it's specifically meant to be set
  // on a PAST instance once it's rolled over incomplete (the forced-excuse
  // flow targets the previous week's instanceId directly).
  const updateData: any = {};

  if (body.status !== undefined) {
    updateData.status = body.status;
    updateData.completedAt = body.status === "COMPLETE" ? new Date() : null;
    updateData.completedById = body.status === "COMPLETE" ? session.user.id : null;
  }

  if (body.isActivated !== undefined) {
    updateData.isActivated = body.isActivated;
  }

  if (body.comment !== undefined) {
    updateData.comment = body.comment;
  }

  const updated = await prisma.taskInstance.update({
    where: { id: instanceId },
    data: updateData,
  });

  return NextResponse.json(updated);
}
