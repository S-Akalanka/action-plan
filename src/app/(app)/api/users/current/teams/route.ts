import { NextResponse } from "next/server";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.role === "ADMIN" || user.role === "CEO") {
    const allTeams = await prisma.team.findMany({
      select: { id: true, teamName: true },
      orderBy: { teamName: "asc" },
    });
    return NextResponse.json(allTeams);
  }

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: { team: { select: { id: true, teamName: true } } },
  });

  return NextResponse.json(memberships.map((m) => m.team));
}
