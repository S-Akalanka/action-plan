// GET /api/admin/teams/[teamId]/tasks

import { NextResponse } from "next/server";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { requireAdminOrCeo } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const isAdminOrCeo = await requireAdminOrCeo(session.user.id);
  if (!isAdminOrCeo) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const tasks = await prisma.task.findMany({
    where: { teamId, source: "STANDARD" },
    orderBy: { category: "asc" },
  });

  return NextResponse.json(tasks);
}
