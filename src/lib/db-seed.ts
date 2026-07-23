import { prisma } from "./prisma";

export async function seedDatabaseIfEmpty() {
  const teamCount = await prisma.team.count();
  if (teamCount > 0) return;

  console.log("Seeding database with teams, users, memberships, and tasks...");

  // 1. Teams — all 5, matching the BRD's business units
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

  // 2. Users — microsoftId is a placeholder until real Entra ID login is
  // wired in (lib/session.ts is currently stubbed).
  const userTeam = await prisma.user.create({
    data: { microsoftId: "seed-engineering-lead", name: "Engineering Lead", role: "TEAM" },
  });

  const userTeam2 = await prisma.user.create({
    data: { microsoftId: "seed-bu01-lead", name: "BU01 Lead", role: "TEAM" },
  });

  const userAdmin = await prisma.user.create({
    data: { microsoftId: "seed-hr-manager", name: "HR Manager", role: "ADMIN" },
  });

  const userCeo = await prisma.user.create({
    data: { microsoftId: "seed-ceo-office", name: "CEO", role: "CEO" },
  });

  // 3. Memberships — one TEAM-role member per team so any team can be
  // tested with a real non-admin user, not just the two that had one before.
  const membershipData = [
    { userId: userTeam.id, teamId: "bu01" },
    { userId: userTeam.id, teamId: "engineering" },
    { userId: userTeam2.id, teamId: "bu02" },
    { userId: userAdmin.id, teamId: "hr-admin" },
  ];
  for (const m of membershipData) {
    await prisma.membership.create({ data: m });
  }
  // ADMIN and CEO bypass per-team Membership checks via canAccessTeam(),
  // so userAdmin/userCeo don't strictly need rows for every team.

  // 4. Standard Tasks — every team gets one task per category (Finance,
  // Customer, Process/Tech, People) so every screen has something real to
  // show, instead of some teams/categories being empty by omission.
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday of current week
  weekStart.setHours(0, 0, 0, 0);

  const tasksData = [
    // BU01 — North America Retail
    { teamId: "bu01", createdById: userAdmin.id, category: "FINANCE" as const, description: "Reconcile weekly cash position", kpiReference: "Ledger Accuracy %", frequency: "WEEKLY" as const },
    { teamId: "bu01", createdById: userAdmin.id, category: "CUSTOMER" as const, description: "Review top-10 customer health scores", kpiReference: "NPS", frequency: "WEEKLY" as const },
    { teamId: "bu01", createdById: userAdmin.id, category: "PROCESS_TECH" as const, description: "Audit POS system uptime", kpiReference: "Uptime %", frequency: "WEEKLY" as const },
    { teamId: "bu01", createdById: userAdmin.id, category: "PEOPLE" as const, description: "Review store staffing levels", kpiReference: "Coverage %", frequency: "WEEKLY" as const },

    // BU02 — EMEA Wholesale
    { teamId: "bu02", createdById: userAdmin.id, category: "FINANCE" as const, description: "Reconcile wholesale invoices", kpiReference: "Invoice Accuracy %", frequency: "WEEKLY" as const },
    { teamId: "bu02", createdById: userAdmin.id, category: "CUSTOMER" as const, description: "Follow up with distributor accounts", kpiReference: "Response Time", frequency: "WEEKLY" as const },
    { teamId: "bu02", createdById: userAdmin.id, category: "PROCESS_TECH" as const, description: "Audit warehouse inventory system", kpiReference: "Sync Accuracy %", frequency: "MONTHLY" as const },
    { teamId: "bu02", createdById: userAdmin.id, category: "PEOPLE" as const, description: "Review regional staffing plan", kpiReference: "Headcount Variance", frequency: "QUARTERLY" as const },

    // Engineering
    { teamId: "engineering", createdById: userTeam.id, category: "FINANCE" as const, description: "Review cloud infrastructure spend", kpiReference: "Budget Variance", frequency: "MONTHLY" as const },
    { teamId: "engineering", createdById: userTeam.id, category: "CUSTOMER" as const, description: "Triage customer-reported bugs", kpiReference: "Bug Resolution SLA", frequency: "WEEKLY" as const },
    { teamId: "engineering", createdById: userTeam.id, category: "PROCESS_TECH" as const, description: "Deploy weekly staging build", kpiReference: "Uptime %", frequency: "WEEKLY" as const },
    { teamId: "engineering", createdById: userTeam.id, category: "PEOPLE" as const, description: "Conduct 1-on-1 development reviews", kpiReference: "Retention Rate", frequency: "WEEKLY" as const },

    // HR & Admin
    { teamId: "hr-admin", createdById: userAdmin.id, category: "FINANCE" as const, description: "Verify payroll run accuracy", kpiReference: "Payroll Accuracy %", frequency: "WEEKLY" as const },
    { teamId: "hr-admin", createdById: userAdmin.id, category: "CUSTOMER" as const, description: "Respond to employee HR tickets", kpiReference: "Ticket Response Time", frequency: "WEEKLY" as const },
    { teamId: "hr-admin", createdById: userAdmin.id, category: "PROCESS_TECH" as const, description: "Audit HRIS data integrity", kpiReference: "Data Accuracy %", frequency: "MONTHLY" as const },
    { teamId: "hr-admin", createdById: userAdmin.id, category: "PEOPLE" as const, description: "Verify team timesheet submissions", kpiReference: "Payroll Compliance %", frequency: "WEEKLY" as const },

    // Sales & Marketing
    { teamId: "sales-marketing", createdById: userAdmin.id, category: "FINANCE" as const, description: "Reconcile campaign spend vs. budget", kpiReference: "Budget Variance", frequency: "MONTHLY" as const },
    { teamId: "sales-marketing", createdById: userAdmin.id, category: "CUSTOMER" as const, description: "Follow up with qualified leads", kpiReference: "Lead Response Time", frequency: "WEEKLY" as const },
    { teamId: "sales-marketing", createdById: userAdmin.id, category: "PROCESS_TECH" as const, description: "Audit CRM data quality", kpiReference: "Data Completeness %", frequency: "MONTHLY" as const },
    { teamId: "sales-marketing", createdById: userAdmin.id, category: "PEOPLE" as const, description: "Review quarterly sales team targets", kpiReference: "Quota Attainment %", frequency: "QUARTERLY" as const },
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

    // Mix of statuses so the dashboard/completion % isn't just 0% or 100%
    // across the board — makes the seeded data actually useful to look at.
    const rand = Math.random();
    const status = rand < 0.6 ? "COMPLETE" : "INCOMPLETE";
    const isActivated = status === "INCOMPLETE" && rand > 0.3;

    await prisma.taskInstance.create({
      data: {
        taskId: created.id,
        weekStartDate: weekStart,
        status,
        isActivated,
        completedAt: status === "COMPLETE" ? new Date() : null,
        completedById: status === "COMPLETE" ? task.createdById : null,
      },
    });
  }

  console.log(`Seeded ${teams.length} teams, 3 users, ${membershipData.length} memberships, ${tasksData.length} tasks.`);
}
