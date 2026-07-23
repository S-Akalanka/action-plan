import { prisma } from "@/lib/prisma";
import { fileURLToPath } from "url";

// Helpful runtime info when invoked from npm/tsx
console.log("db-seed: invoked", { argv: process.argv.slice(0, 4) });

export async function seedDatabaseIfEmpty() {
  const teamCount = await prisma.team.count();
  if (teamCount > 0) return;

  console.log("Seeding minimal database...");

  // 1. Teams — two minimal teams
  const teams = [
    { id: "team1", teamName: "Team One", description: "First team" },
    { id: "team2", teamName: "Team Two", description: "Second team" },
  ];
  for (const t of teams) {
    await prisma.team.create({ data: t });
  }

  // 2. Users — one per team
  const user1 = await prisma.user.create({
    data: { microsoftId: "user1", name: "User One", role: "TEAM" },
  });
  const user2 = await prisma.user.create({
    data: { microsoftId: "user2", name: "User Two", role: "TEAM" },
  });

  // 3. Memberships
  await prisma.membership.createMany({
    data: [
      { userId: user1.id, teamId: "team1" },
      { userId: user2.id, teamId: "team2" },
    ],
  });

  // 4. Minimal tasks — two per team
  const tasksData = [
    {
      teamId: "team1",
      createdById: user1.id,
      category: "FINANCE" as const,
      description: "Task A for Team One",
      kpiReference: "KPI A",
      frequency: "WEEKLY" as const,
      source: "STANDARD",
    },
    {
      teamId: "team1",
      createdById: user1.id,
      category: "CUSTOMER" as const,
      description: "Task B for Team One",
      kpiReference: "KPI B",
      frequency: "WEEKLY" as const,
      source: "STANDARD",
    },
    {
      teamId: "team2",
      createdById: user2.id,
      category: "FINANCE" as const,
      description: "Task A for Team Two",
      kpiReference: "KPI A",
      frequency: "WEEKLY" as const,
      source: "STANDARD",
    },
    {
      teamId: "team2",
      createdById: user2.id,
      category: "CUSTOMER" as const,
      description: "Task B for Team Two",
      kpiReference: "KPI B",
      frequency: "WEEKLY" as const,
      source: "STANDARD",
    },
  ];

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);

  for (const task of tasksData) {
    const created = await prisma.task.create({ data: task });
    await prisma.taskInstance.create({
      data: {
        taskId: created.id,
        weekStartDate: weekStart,
        status: "INCOMPLETE",
        isActivated: false,
      },
    });
  }

  console.log(`Seeded ${teams.length} teams, 2 users, ${tasksData.length} tasks.`);
}

const scriptPath = fileURLToPath(import.meta.url);
const maybeArg = process.argv[1] || "";
const isDirectRun =
  scriptPath === maybeArg ||
  maybeArg.endsWith("/scripts/db-seed.ts") ||
  maybeArg.endsWith("\\scripts\\db-seed.ts") ||
  process.argv.some((a) => a.endsWith("db-seed.ts"));

if (isDirectRun) {
  seedDatabaseIfEmpty().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
