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
