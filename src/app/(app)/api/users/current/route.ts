import { NextResponse } from "next/server";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET /api/users/current — Retrieve authenticated user's profile
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

  // Return user profile
  return NextResponse.json({
    userId: user.id,
    name: user.name,
    role: user.role,
    username: user.microsoftId,
  });
}
