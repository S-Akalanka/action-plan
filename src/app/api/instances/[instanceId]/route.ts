// PATCH /api/instances/[instanceId]

import { NextResponse } from "next/server";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessTeam } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const { instanceId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const instance = await prisma.taskInstance.findUnique({
    where: { id: instanceId },
    include: { task: true },
  });
  if (!instance) return NextResponse.json({ error: "Instance not found" }, { status: 404 });

  const allowed = await canAccessTeam(session.user.id, instance.task.teamId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { status } = await req.json();

  const updated = await prisma.taskInstance.update({
    where: { id: instanceId },
    data: {
      status,
      completedAt: status === "COMPLETE" ? new Date() : null,
      // completedById always comes from the session, never from the request body
      completedById: status === "COMPLETE" ? session.user.id : null,
    },
  });

  return NextResponse.json(updated);
}
