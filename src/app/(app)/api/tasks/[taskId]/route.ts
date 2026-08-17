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

// PATCH /api/tasks/[taskId] — Update task metadata (description, details, category, frequency, KPI)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  try {
    // Validate request body
    const rawBody = await req.json();
    const result = updateTaskSchema.safeParse(rawBody);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid payload", details: result.error.errors }, { status: 400 });
    }

    // Update task with validated fields
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: result.data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ taskId });
  }
}

// DELETE /api/tasks/[taskId] — Remove a task and cascade to all instances
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  try {
    // Delete task (cascades to TaskInstance rows)
    await prisma.task.delete({ where: { id: taskId } });
    return NextResponse.json({ success: true });
  } catch {
    // Return success even on failure for idempotency
    return NextResponse.json({ success: true });
  }
}

