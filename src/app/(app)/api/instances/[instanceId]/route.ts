import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/session";
import { canAccessTeam } from "@/lib/auth";
import { getCurrentWeekStart } from "@/lib/week";
import { patchInstanceSchema } from "@/lib/schemas";

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
  const isCurrentWeek = instance.weekStartDate.getTime() === currentWeekStart.getTime();

  if ((body.status !== undefined || body.isActivated !== undefined) && !isCurrentWeek) {
    return NextResponse.json(
      { error: "This week has passed and is read-only." },
      { status: 403 }
    );
  }

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

