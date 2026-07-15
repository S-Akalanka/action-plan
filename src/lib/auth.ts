import { prisma } from "./prisma";

export async function canAccessTeam(userId: string, teamId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;

  // ADMIN/CEO bypass
  if (user.role === "ADMIN" || user.role === "CEO") return true;

  const membership = await prisma.membership.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });
  return !!membership;
}

export async function requireAdminOrCeo(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.role === "ADMIN" || user?.role === "CEO";
}
