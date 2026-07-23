// GET /api/users/current

import { NextResponse } from "next/server";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      if (user) {
        return NextResponse.json({
          userId: user.id,
          name: user.name,
          role: user.role,
          username: user.microsoftId,
        });
      }
    }
    return NextResponse.json({
      userId: "guest",
      name: "Guest User",
      role: "ADMIN",
      username: "guest",
    });
  } catch (error) {
    return NextResponse.json({
      userId: "guest",
      name: "Guest User",
      role: "ADMIN",
      username: "guest",
    });
  }
}
