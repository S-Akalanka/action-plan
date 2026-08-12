import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateTaskSchema = z.object({
  description: z.string().trim().optional(),
  details: z.string().trim().nullable().optional(),
  kpiReference: z.string().trim().nullable().optional(),
  category: z.string().optional(),
  frequency: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  try {
    const rawBody = await req.json();
    const result = updateTaskSchema.safeParse(rawBody);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid payload", details: result.error.errors }, { status: 400 });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: result.data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ taskId });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  try {
    await prisma.task.delete({ where: { id: taskId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}

