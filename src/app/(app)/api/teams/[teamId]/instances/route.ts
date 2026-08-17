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

// Parses a YYYY-MM-DD string as a LOCAL calendar date at local midnight.
// `new Date("2026-06-29")` parses as UTC midnight, which does not match
// getCurrentWeekStart() unless that also normalizes to UTC — mixing the
// two silently breaks isViewingCurrentWeek. Confirm getCurrentWeekStart()
// uses the same (local) convention; if it's UTC-based instead, swap this
// to Date.UTC(year, month - 1, day) so both sides agree.
function parseWeekParam(week: string) {
  const [year, month, day] = week.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

// GET /api/teams/[teamId]/instances — Fetch task instances for a team for a given week
// Self-healing: auto-generates missing current-week instances if cron hasn't run
// For current week: returns fresh instances + overdue instances from earlier weeks
export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  // Verify user authentication
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

  // Self-healing fallback — only for the current week. Safe to call every
  // time (uses skipDuplicates internally), cheap no-op if cron already ran.
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
