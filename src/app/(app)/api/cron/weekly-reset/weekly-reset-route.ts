// app/api/cron/weekly-reset/route.ts
// POST /api/cron/weekly-reset
//
// Matches Journey 6 from the BRD: a scheduled job that runs at the start
// of each week and generates fresh TaskInstance rows for every active
// standard task that's due. Protected by a secret header, not a user
// session — this is meant to be called by a scheduler, not a person.
//
// Scheduling this (pick one, whenever you deploy):
// - Vercel Cron: add to vercel.json -> { "crons": [{ "path": "/api/cron/weekly-reset", "schedule": "0 0 * * 1" }] }
// - GitHub Actions: a scheduled workflow that curls this endpoint with the secret header
// - Any external scheduler that can hit an HTTPS endpoint on a timer

import { NextResponse } from "next/server";
import { generateInstancesForWeek } from "@/lib/generate-instances";
import { getCurrentWeekStart } from "@/lib/week";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekStart = getCurrentWeekStart();
  const created = await generateInstancesForWeek(weekStart);

  return NextResponse.json({ weekStart: weekStart.toISOString(), created });
}
