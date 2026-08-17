import { NextResponse } from "next/server";
import { generateInstancesForWeek } from "@/lib/generate-instances";
import { getCurrentWeekStart } from "@/lib/week";

// POST /api/cron/weekly-reset — Generate task instances for the current week (scheduled job)
// Protected by CRON_SECRET header (scheduler authentication, not user session)
// Runs at the start of each week to create fresh TaskInstance rows for active recurring tasks
export async function POST(req: Request) {
  // Validate scheduler secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Generate instances for the current week
  const weekStart = getCurrentWeekStart();
  const created = await generateInstancesForWeek(weekStart);

  return NextResponse.json({ weekStart: weekStart.toISOString(), created });
}
