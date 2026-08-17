import { NextResponse } from "next/server";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessTeam } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const allowed = await canAccessTeam(session.user.id, teamId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  return NextResponse.json(team);
}
