// app/api/instances/[taskId]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  try {
    const body = await req.json();

    const instance = await prisma.taskInstance.findFirst({
      where: {
        taskId: taskId,
      },
      orderBy: {
        weekStartDate: "desc",
      },
      select: {
        id: true,
      },
    });

    if (!instance) {
      return NextResponse.json(
        { error: "Instance not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.taskInstance.update({
      where: {
        id: instance.id,
      },
      data: {
        ...(body.status !== undefined && {
          status: body.status,
          completedAt:
            body.status === "COMPLETE" ? new Date() : null,
        }),

        ...(body.isActivated !== undefined && {
          isActivated: body.isActivated,
        }),
      },
    });

    return NextResponse.json(updated);

  } catch (error) {
    console.error(
      `Database update failed for instance ${taskId}:`,
      error
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}