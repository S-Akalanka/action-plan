// GET /api/dashboard?week=2026-06-29

import { NextResponse } from "next/server";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { requireAdminOrCeo } from "@/lib/auth";
import { getCurrentWeekStart } from "@/lib/week";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const isAdminOrCeo = await requireAdminOrCeo(session.user.id);
  if (!isAdminOrCeo) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const weekParam = searchParams.get("week");
  const weekStart = weekParam ? new Date(weekParam) : getCurrentWeekStart();

  const teams = await prisma.team.findMany();

  const result = await Promise.all(
    teams.map(async (team) => {
      const instances = await prisma.taskInstance.findMany({
        where: { weekStartDate: weekStart, task: { teamId: team.id } },
        include: { task: true },
      });

      const categories = ["FINANCE", "CUSTOMER", "PROCESS_TECH", "PEOPLE"] as const;
      const categoryPct: Record<string, number> = {};

      for (const cat of categories) {
        const inCategory = instances.filter((i) => i.task.category === cat);
        const completed = inCategory.filter((i) => i.status === "COMPLETE").length;
        categoryPct[cat] = inCategory.length > 0
          ? Math.round((completed / inCategory.length) * 100)
          : 0;
      }

      const totalCompleted = instances.filter((i) => i.status === "COMPLETE").length;
      const overall = instances.length > 0
        ? Math.round((totalCompleted / instances.length) * 100)
        : 0;

      return {
        teamId: team.id,
        teamName: team.teamName,
        categories: categoryPct,
        overall,
      };
    })
  );

  return NextResponse.json(result);
}
