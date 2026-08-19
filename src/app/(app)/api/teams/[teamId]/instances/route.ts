// Returns current-week instances and, when viewing the current week, all
// earlier incomplete instances without comments as separate overdue items.

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/session";
import { canAccessTeam } from "@/lib/auth";
import { getCurrentWeekStart, normalizeToMonday } from "@/lib/week";
import { generateInstancesForWeek } from "@/lib/generate-instances";

const weekQuerySchema = z.object({
  week: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "week must be formatted as YYYY-MM-DD")
    .optional(),
});

// Parse calendar dates as UTC to match the database date representation.
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

  const weekStart = normalizeToMonday(
    parsedQuery.data.week ? parseWeekParam(parsedQuery.data.week) : getCurrentWeekStart()
  );
  const currentWeekStart = getCurrentWeekStart();
  const isViewingCurrentWeek = weekStart.getTime() === currentWeekStart.getTime();

  // Fill gaps left by a missed scheduled generation.
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

  // Query overdue work independently so tasks without a current-week
  // instance are included as well.
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
