import { prisma } from "./prisma";

export async function seedDatabaseIfEmpty() {
  const teamCount = await prisma.team.count();
  if (teamCount > 0) return;

  console.log("Seeding database with initial teams, users, memberships, and tasks...");

  // 1. Create Teams
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

  // 2. Create Users
  const userTeam = await prisma.user.create({
    data: {
      username: "engineering-lead",
      name: "Engineering Lead",
      role: "TEAM",
    },
  });

  const userAdmin = await prisma.user.create({
    data: {
      username: "hr-manager",
      name: "HR Manager",
      role: "ADMIN",
    },
  });

  const userCeo = await prisma.user.create({
    data: {
      username: "ceo-office",
      name: "CEO",
      role: "CEO",
    },
  });

  // 3. Create Memberships
  await prisma.membership.create({
    data: {
      userId: userTeam.id,
      teamId: "engineering",
    },
  });

  await prisma.membership.create({
    data: {
      userId: userAdmin.id,
      teamId: "hr-admin",
    },
  });

  // 4. Create Standard Tasks
  const dateStr = new Date();
  dateStr.setDate(dateStr.getDate() - dateStr.getDay() + 1); // Current week Monday
  dateStr.setHours(0, 0, 0, 0);

  const tasksData = [
    {
      teamId: "bu01",
      createdById: userAdmin.id,
      category: "FINANCE",
      description: "Reconcile weekly cash position",
      kpiReference: "Ledger Accuracy %",
      frequency: "WEEKLY",
    },
    {
      teamId: "bu01",
      createdById: userAdmin.id,
      category: "CUSTOMER",
      description: "Review top-10 customer health scores",
      kpiReference: "NPS",
      frequency: "WEEKLY",
    },
    {
      teamId: "engineering",
      createdById: userTeam.id,
      category: "PROCESS_TECH",
      description: "Deploy weekly staging build",
      kpiReference: "Uptime %",
      frequency: "WEEKLY",
    },
    {
      teamId: "engineering",
      createdById: userTeam.id,
      category: "PEOPLE",
      description: "Conduct 1-on-1 development reviews",
      kpiReference: "Retention Rate",
      frequency: "WEEKLY",
    },
    {
      teamId: "hr-admin",
      createdById: userAdmin.id,
      category: "PEOPLE",
      description: "Verify team timesheet submissions",
      kpiReference: "Payroll Compliance %",
      frequency: "WEEKLY",
    },
  ];

  for (const task of tasksData) {
    const t = await prisma.task.create({
      data: {
        teamId: task.teamId,
        createdById: task.createdById,
        category: task.category as any,
        description: task.description,
        kpiReference: task.kpiReference,
        frequency: task.frequency as any,
      },
    });

    // Create an instance for the current week
    await prisma.taskInstance.create({
      data: {
        taskId: t.id,
        weekStartDate: dateStr,
        status: "INCOMPLETE",
      },
    });
  }

  console.log("Database seeded successfully.");
}
