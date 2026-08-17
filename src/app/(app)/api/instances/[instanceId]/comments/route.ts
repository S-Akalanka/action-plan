import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/session";
import { canAccessTeam } from "@/lib/auth";

// GET /api/instances/[instanceId]/comments — Retrieve the single comment for an instance
export async function GET(
  req: Request,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const { instanceId } = await params;

  // Verify user authentication
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Fetch instance comment with commenter name
  const instance = await prisma.taskInstance.findUnique({
    where: { id: instanceId },
    include: { commentedBy: { select: { name: true } } },
  });

  if (!instance) {
    return NextResponse.json({ error: "Instance not found" }, { status: 404 });
  }

  // Return comment metadata
  return NextResponse.json({
    comment: instance.comment,
    commentedAt: instance.commentedAt,
    commentedByName: instance.commentedBy?.name ?? null,
  });
}

// PUT /api/instances/[instanceId]/comments — Set or replace the instance comment
export async function PUT(
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

  // Validate comment body
  const body = await req.json();
  if (!body.body?.trim()) {
    return NextResponse.json({ error: "Comment body is required" }, { status: 400 });
  }

  // Update instance comment (scalar field)
  const updated = await prisma.taskInstance.update({
    where: { id: instanceId },
    data: {
      comment: body.body.trim(),
      commentedAt: new Date(),
      commentedById: session.user.id,
    },
    include: { commentedBy: { select: { name: true } } },
  });

  return NextResponse.json({
    comment: updated.comment,
    commentedAt: updated.commentedAt,
    commentedByName: updated.commentedBy?.name ?? null,
  });
}
