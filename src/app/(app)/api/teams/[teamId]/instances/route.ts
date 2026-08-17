// app/api/teams/[teamId]/instances/route.ts
// GET /api/teams/[teamId]/instances?week=2026-06-29
//
// Self-healing: if viewing the CURRENT week and some due tasks have no
// instance yet (e.g. the scheduled cron hasn't run), this generates them
// on the fly before returning — same underlying function the real cron
// route calls. Past weeks are never generated on-demand, since they're
// frozen/historical by definition.
//
// For the current week, any earlier incomplete-uncommented instance is
// returned as a SEPARATE item in the array (same taskId, isOverdue: true)
// alongside the fresh current-week instance if one exists — not a pointer
// field. The frontend renders each as its own row. Not limited to exactly
// one week back: a task can go overdue by more than one cycle, especially
// ONCE tasks past their deadline, which never get a new current-week
// instance to begin with.

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/session";
import { canAccessTeam } from "@/lib/auth";
import { getCurrentWeekStart } from "@/lib/week";
import { generateInstancesForWeek } from "@/lib/generate-instances";

const weekQuerySchema = z.object({
  week: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "week must be formatted as YYYY-MM-DD")
    .optional(),
});

// Parses a YYYY-MM-DD string as UTC midnight, matching getCurrentWeekStart()
// (see lib/week.ts) — both must agree or isViewingCurrentWeek silently
// breaks and instances land on the wrong day.
function parseWeekParam(week: string) {
  const [year, month, day] = week.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const allowed = await canAccessTeam(session.user.id, teamId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const parsedQuery = weekQuerySchema.safeParse({
    week: searchParams.get("week") ?? undefined,
  });
  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: parsedQuery.error.issues[0]?.message ?? "Invalid week param" },
      { status: 400 }
    );
  }

  const weekStart = parsedQuery.data.week
    ? parseWeekParam(parsedQuery.data.week)
    : getCurrentWeekStart();
  const currentWeekStart = getCurrentWeekStart();
  const isViewingCurrentWeek = weekStart.getTime() === currentWeekStart.getTime();

  if (isViewingCurrentWeek) {
    await generateInstancesForWeek(weekStart);
  }

  const currentInstances = await prisma.taskInstance.findMany({
    where: { weekStartDate: weekStart, task: { teamId } },
  });

  if (!isViewingCurrentWeek) {
    return NextResponse.json(currentInstances.map((i) => ({ ...i, isOverdue: false })));
  }

  const result: any[] = currentInstances.map((i) => ({ ...i, isOverdue: false }));

  // Any earlier incomplete, uncommented instance for this team is overdue —
  // queried independently rather than keyed off a current-week sibling.
  // A task can be overdue without ever getting a fresh current-week
  // instance: isTaskDueForWeek() returns false once a task's deadline has
  // passed (including ONCE tasks), so generateInstancesForWeek() never
  // creates a new row for it — the old loop only checked a task's previous
  // week if it ALSO had a current-week instance, so these never surfaced.
  const overdueInstances = await prisma.taskInstance.findMany({
    where: {
      weekStartDate: { lt: weekStart },
      status: "INCOMPLETE",
      task: { teamId },
      comment: null,
    },
  });

  result.push(...overdueInstances.map((i) => ({ ...i, isOverdue: true })));

  return NextResponse.json(result);
}
