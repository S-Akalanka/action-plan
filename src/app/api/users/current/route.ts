// GET /api/users/current
//
// FIXED: removed the fallback that silently returned a fake ADMIN user
// whenever the session was missing or the DB lookup failed. That meant
// any error or logged-out state was treated as full admin access — the
// opposite of secure. Now it correctly returns 401 when there's no
// valid session.

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

  return NextResponse.json({
    userId: user.id,
    name: user.name,
    role: user.role,
    username: user.microsoftId,
  });
}
