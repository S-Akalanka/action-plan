// app/api/instances/[instanceId]/comments/route.ts
// GET  /api/instances/[instanceId]/comments  — full history, newest first
// POST /api/instances/[instanceId]/comments  — add a new comment

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/session";
import { canAccessTeam } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const { instanceId } = await params;

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const comments = await prisma.comment.findMany({
    where: { taskInstanceId: instanceId },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json(
    comments.map((c) => ({
      id: c.id,
      body: c.body,
      authorName: c.author.name,
      createdAt: c.createdAt,
    }))
  );
}

export async function POST(
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
  if (!body.body?.trim()) {
    return NextResponse.json({ error: "Comment body is required" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      taskInstanceId: instanceId,
      authorId: session.user.id,
      body: body.body.trim(),
    },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json(
    {
      id: comment.id,
      body: comment.body,
      authorName: comment.author.name,
      createdAt: comment.createdAt,
    },
    { status: 201 }
  );
}
