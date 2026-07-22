import { prisma } from "./prisma";

export async function seedDatabaseIfEmpty() {
  const teamCount = await prisma.team.count();
  if (teamCount > 0) return;

  console.log("Seeding database with initial teams, users, memberships, and tasks...");

  // 1. Teams
  const teams = [
    { id: "bu01", teamName: "BU01 · North America Retail", description: "NA Retail business unit" },
    { id: "bu02", teamName: "BU02 · EMEA Wholesale", description: "EMEA Wholesale business unit" },
    { id: "engineering", teamName: "Engineering", description: "Core Engineering division" },
    { id: "hr-admin", teamName: "HR & Admin", description: "Human Resources and Administration" },
    { id: "sales-marketing", teamName: "Sales & Marketing", description: "Sales and marketing operations" },
  ];

  for (const t of teams) {
    await prisma.team.create({ data: t });
  }

  // 2. Users — microsoftId is a placeholder here since real Entra ID login
  // is still stubbed (lib/session.ts). These are fake but unique IDs so the
  // seed can run standalone; they get replaced by real Microsoft account IDs
  // once real auth is wired in.
  const userTeam = await prisma.user.create({
    data: {
      microsoftId: "seed-engineering-lead",
      name: "Engineering Lead",
      role: "TEAM",
    },
  });

  const userAdmin = await prisma.user.create({
    data: {
      microsoftId: "seed-hr-manager",
      name: "HR Manager",
      role: "ADMIN",
    },
  });

  const userCeo = await prisma.user.create({
    data: {
      microsoftId: "seed-ceo-office",
      name: "CEO",
      role: "CEO",
    },
  });

  // 3. Memberships — every team needs at least one TEAM-role member so a
  // non-admin user can be tested against each team's data, not just the
  // two that happened to have one before.
  await prisma.membership.create({ data: { userId: userTeam.id, teamId: "engineering" } });
  await prisma.membership.create({ data: { userId: userAdmin.id, teamId: "hr-admin" } });
  // ADMIN and CEO roles bypass per-team Membership checks via canAccessTeam(),
  // so they don't strictly need rows here — but HR/CEO also having a "home"
  // team membership matches how HR was scoped earlier (dual: admin + own team).

  // 4. Standard Tasks — category and frequency now match the schema's actual
  // enums exactly, no `as any` casts hiding mismatches.
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday of current week
  weekStart.setHours(0, 0, 0, 0);

  const tasksData = [
    {
      teamId: "bu01",
      createdById: userAdmin.id,
      category: "FINANCE" as const,
      description: "Reconcile weekly cash position",
      kpiReference: "Ledger Accuracy %",
      frequency: "WEEKLY" as const,
    },
    {
      teamId: "bu01",
      createdById: userAdmin.id,
      category: "CUSTOMER" as const,
      description: "Review top-10 customer health scores",
      kpiReference: "NPS",
      frequency: "WEEKLY" as const,
    },
    {
      teamId: "engineering",
      createdById: userTeam.id,
      category: "PROCESS_TECH" as const,
      description: "Deploy weekly staging build",
      kpiReference: "Uptime %",
      frequency: "WEEKLY" as const,
    },
    {
      teamId: "engineering",
      createdById: userTeam.id,
      category: "PEOPLE" as const,
      description: "Conduct 1-on-1 development reviews",
      kpiReference: "Retention Rate",
      frequency: "WEEKLY" as const,
    },
    {
      teamId: "hr-admin",
      createdById: userAdmin.id,
      category: "PEOPLE" as const,
      description: "Verify team timesheet submissions",
      kpiReference: "Payroll Compliance %",
      frequency: "WEEKLY" as const,
    },
  ];

  for (const task of tasksData) {
    const created = await prisma.task.create({
      data: {
        teamId: task.teamId,
        createdById: task.createdById,
        category: task.category,
        description: task.description,
        kpiReference: task.kpiReference,
        frequency: task.frequency,
        source: "STANDARD",
      },
    });

    await prisma.taskInstance.create({
      data: {
        taskId: created.id,
        weekStartDate: weekStart,
        status: "INCOMPLETE",
        isActivated: false,
      },
    });
  }

  console.log("Database seeded successfully.");
}
