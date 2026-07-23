// app/api/admin/teams/[teamId]/tasks/route.ts
// GET /api/admin/teams/[teamId]/tasks

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MOCK_STANDARD_TASKS: Record<string, any[]> = {
  bu01: [
    { taskId: "t1", teamId: "bu01", category: "FINANCE", description: "Reconcile weekly cash position", details: "", kpiReference: "Ledger Accuracy %", frequency: "WEEKLY", isActive: true },
    { taskId: "t2", teamId: "bu01", category: "CUSTOMER", description: "Review top-10 customer health scores", details: "", kpiReference: "NPS", frequency: "WEEKLY", isActive: true },
  ],
  engineering: [
    { taskId: "t3", teamId: "engineering", category: "PROCESS_TECH", description: "Deploy weekly staging build", details: "", kpiReference: "Uptime %", frequency: "WEEKLY", isActive: true },
    { taskId: "t4", teamId: "engineering", category: "PEOPLE", description: "Conduct 1-on-1 development reviews", details: "", kpiReference: "Retention Rate", frequency: "WEEKLY", isActive: true },
  ],
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  try {
    const tasks = await prisma.task.findMany({ 
      where: { teamId, source: "STANDARD" }, 
      orderBy: { category: "asc" } 
    });
    
    if (!tasks || tasks.length === 0) {
      return NextResponse.json(MOCK_STANDARD_TASKS[teamId] ?? []);
    }
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.warn(`Database query failed in /api/admin/teams/${teamId}/tasks, serving fallback data:`, error);
    return NextResponse.json(MOCK_STANDARD_TASKS[teamId] ?? []);
  }
}
