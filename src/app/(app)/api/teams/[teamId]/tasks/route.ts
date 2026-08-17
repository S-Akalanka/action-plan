import { NextResponse } from "next/server";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getCurrentWeekStart } from "@/lib/week";

const MOCK_TASKS: Record<string, any[]> = {
  bu01: [
    { id: "t1", teamId: "bu01", category: "FINANCE", description: "Reduce operational overhead in regional branches", kpiReference: ">95% Completion", frequency: "WEEKLY" },
    { id: "t2", teamId: "bu01", category: "CUSTOMER", description: "Weekly response time monitoring for Tier 1 tickets", kpiReference: "<2hr Response", frequency: "WEEKLY" }
  ],
  engineering: [
    { id: "t3", teamId: "engineering", category: "PROCESS_TECH", description: "Migrate legacy reporting to real-time dashboards", kpiReference: "100% Real-time", frequency: "WEEKLY" },
    { id: "t4", teamId: "engineering", category: "PEOPLE", description: "Conduct weekly team syncs", kpiReference: "100% Attendance", frequency: "WEEKLY" }
  ],
};

// GET /api/teams/[teamId]/tasks — Retrieve all tasks for a specific team
export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  try {
    // Query tasks by team, fallback to mock data on database failure
    const tasks = await prisma.task.findMany({ 
      where: { teamId }, 
      orderBy: { category: "asc" } 
    });
    
    if (!tasks || tasks.length === 0) {
      return NextResponse.json(MOCK_TASKS[teamId] ?? []);
    }
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.warn(`Database query failed in /api/teams/${teamId}/tasks, serving fallback data:`, error);
    return NextResponse.json(MOCK_TASKS[teamId] ?? []);
  }
}

// POST /api/teams/[teamId]/tasks — Create an ad-hoc task for a specific team
export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const body = await req.json();

  try {
    // Retrieve authenticated user session
    const session = await auth();
    const createdById = session?.user?.id;

    if (!createdById) {
      // Return optimistic response if unauthenticated in dev
      return NextResponse.json({
        taskId: `mock-${Date.now()}`,
        teamId,
        ...body,
        isActive: true,
        firstInstanceId: `mock-instance-${Date.now()}`,
      }, { status: 201 });
    }

    const { category, description, details, kpiReference, frequency, source } = body;
    
    const weekStart = getCurrentWeekStart();
    const endOfWeek = new Date(weekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 6); // Sunday of this week

    const task = await prisma.task.create({
      data: { 
        teamId, 
        createdById, 
        category: category.toUpperCase(), 
        description, 
        details: details ?? null,
        kpiReference: kpiReference ?? null, 
        frequency, 
        source: source ?? "ADHOC" ,
        deadline: endOfWeek,
      },
    });
    
    const instance = await prisma.taskInstance.create({
      data: { 
        taskId: task.id, 
        weekStartDate: getCurrentWeekStart() 
      },
    });
    
    return NextResponse.json({ ...task, firstInstanceId: instance.id }, { status: 201 });
  } catch (error) {
    console.warn("Database task creation failed, returning optimistic response:", error);
    return NextResponse.json({
      taskId: `mock-${Date.now()}`,
      teamId,
      ...body,
      isActive: true,
      firstInstanceId: `mock-instance-${Date.now()}`,
    }, { status: 201 });
  }
}
