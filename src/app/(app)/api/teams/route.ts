import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/teams — Retrieve all teams (unfiltered list ordered by name)
export async function GET() {
  const teams = await prisma.team.findMany({
    select: { id: true, teamName: true, description: true },
    orderBy: { teamName: "asc" },
  });
  return NextResponse.json(teams);
}
