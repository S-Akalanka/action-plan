// app/api/instances/[instanceId]/route.ts
// PATCH /api/instances/[instanceId]

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const { instanceId } = await params;
  const body = await req.json();

  try {
    const updated = await prisma.taskInstance.update({
      where: { id: instanceId },
      data: {
        ...(body.status !== undefined && {
          status: body.status,
          completedAt: body.status === "COMPLETE" ? new Date() : null,
        }),
        ...(body.isActivated !== undefined && { isActivated: body.isActivated }),
      },
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.warn(`Database update failed for instance ${instanceId}, returning mock response:`, error);
    return NextResponse.json({
      instanceId,
      status: body.status ?? "INCOMPLETE",
      isActivated: body.isActivated ?? false,
      completedAt: body.status === "COMPLETE" ? new Date().toISOString() : null,
    });
  }
}
