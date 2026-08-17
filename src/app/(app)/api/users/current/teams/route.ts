import { NextResponse } from "next/server";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET /api/users/current/teams — Retrieve teams accessible to authenticated user
// ADMIN/CEO: returns all teams; TEAM: returns only assigned teams via Membership
export async function GET() {
  // Retrieve session
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Fetch user from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Admin/CEO: return all teams
  if (user.role === "ADMIN" || user.role === "CEO") {
    const allTeams = await prisma.team.findMany({
      select: { id: true, teamName: true },
      orderBy: { teamName: "asc" },
    });
    return NextResponse.json(allTeams);
  }

  // Regular user: return only assigned teams
  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: { team: { select: { id: true, teamName: true } } },
  });

  return NextResponse.json(memberships.map((m) => m.team));
}
