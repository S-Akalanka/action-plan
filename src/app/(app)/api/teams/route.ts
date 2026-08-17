import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const teams = await prisma.team.findMany({
    select: { id: true, teamName: true, description: true },
    orderBy: { teamName: "asc" },
  });
  return NextResponse.json(teams);
}
