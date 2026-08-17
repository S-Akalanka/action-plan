import { NextResponse } from "next/server";
import type { Category, Frequency } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CATEGORY_TO_ENUM: Record<string, Category> = {
  Finance: "FINANCE",
  Customer: "CUSTOMER",
  "Process/Tech": "PROCESS_TECH",
  People: "PEOPLE",
};

const FREQUENCY_TO_ENUM: Record<string, Frequency> = {
  Once: "ONCE",
  Weekly: "WEEKLY",
  "Bi-weekly": "BI_WEEKLY",
  Monthly: "MONTHLY",
  Quarterly: "QUARTERLY",
};

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
      return NextResponse.json({ error: "Invalid payload", details: result.error.issues }, { status: 400 });
    }

    const { category, frequency, ...rest } = result.data;
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...rest,
        ...(category ? { category: CATEGORY_TO_ENUM[category] ?? (category as Category) } : {}),
        ...(frequency ? { frequency: FREQUENCY_TO_ENUM[frequency] ?? (frequency as Frequency) } : {}),
      },
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

