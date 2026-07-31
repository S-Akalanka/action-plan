import { prisma } from "./prisma";

// How many weeks of history to generate, oldest first. 0 = current week.
const WEEK_OFFSETS_OLDEST_FIRST = [4, 3, 2, 1, 0];

function mondayOf(weeksAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1 - weeksAgo * 7); // Monday of that week
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function seedDatabase() {
  console.log("Resetting and seeding database with teams, users, memberships, and tasks...");

  // 0. Clear existing data — child tables first to respect FK constraints.
  await prisma.taskInstance.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.membership.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.team.deleteMany({});

  // 1. Teams — all 8, matching the BRD's business units (BU01-04, Engineering,
  // HR & Admin, Finance, Sales & Marketing).
  const teams = [
    { id: "bu01", teamName: "BU01 · North America Retail", description: "NA Retail business unit" },
    { id: "bu02", teamName: "BU02 · EMEA Wholesale", description: "EMEA Wholesale business unit" },
    { id: "bu03", teamName: "BU03 · APAC Retail", description: "APAC Retail business unit" },
    { id: "bu04", teamName: "BU04 · LATAM Distribution", description: "LATAM Distribution business unit" },
    { id: "engineering", teamName: "Engineering", description: "Core Engineering division" },
    { id: "hr-admin", teamName: "HR & Admin", description: "Human Resources and Administration" },
    { id: "finance", teamName: "Finance", description: "Corporate Finance division" },
    { id: "sales-marketing", teamName: "Sales & Marketing", description: "Sales and marketing operations" },
  ];

  for (const t of teams) {
    await prisma.team.create({ data: t });
  }

  // 2. Users — microsoftId is a placeholder until real Entra ID login is
  // wired in (lib/session.ts is currently stubbed). Deliberately varied
  // membership counts (1, 2, or 3 teams per user) since real staff often
  // straddle more than one team.
  const userEngLead = await prisma.user.create({
    data: { microsoftId: "seed-engineering-lead", name: "Engineering Lead", role: "TEAM" },
  });
  const userBu01Lead = await prisma.user.create({
    data: { microsoftId: "seed-bu01-lead", name: "BU01 Lead", role: "TEAM" },
  });
  const userBu02Lead = await prisma.user.create({
    data: { microsoftId: "seed-bu02-lead", name: "BU02 Lead", role: "TEAM" },
  });
  const userBu03Lead = await prisma.user.create({
    data: { microsoftId: "seed-bu03-lead", name: "BU03 Lead", role: "TEAM" },
  });
  const userBu04Lead = await prisma.user.create({
    data: { microsoftId: "seed-bu04-lead", name: "BU04 Lead", role: "TEAM" },
  });
  const userFinanceLead = await prisma.user.create({
    data: { microsoftId: "seed-finance-lead", name: "Finance Lead", role: "TEAM" },
  });
  const userSalesLead = await prisma.user.create({
    data: { microsoftId: "seed-sales-lead", name: "Sales Lead", role: "TEAM" },
  });
  const userFloatAnalyst = await prisma.user.create({
    data: { microsoftId: "seed-float-analyst", name: "Cross-BU Analyst", role: "TEAM" },
  });
  const userAdmin = await prisma.user.create({
    data: { microsoftId: "seed-hr-manager", name: "HR Manager", role: "ADMIN" },
  });
  const userCeo = await prisma.user.create({
    data: { microsoftId: "seed-ceo-office", name: "CEO", role: "CEO" },
  });

  // 3. Memberships — deliberately varied: some users on 1 team, some on 2,
  // some on 3, so team-switching UI actually has something to switch between.
  const membershipData = [
    // 3 teams
    { userId: userEngLead.id, teamId: "engineering" },
    { userId: userEngLead.id, teamId: "bu01" },
    { userId: userEngLead.id, teamId: "finance" },

    { userId: userFloatAnalyst.id, teamId: "bu02" },
    { userId: userFloatAnalyst.id, teamId: "bu03" },
    { userId: userFloatAnalyst.id, teamId: "bu04" },

    // 2 teams
    { userId: userBu01Lead.id, teamId: "bu01" },
    { userId: userBu01Lead.id, teamId: "sales-marketing" },

    { userId: userFinanceLead.id, teamId: "finance" },
    { userId: userFinanceLead.id, teamId: "hr-admin" },

    // 1 team
    { userId: userBu02Lead.id, teamId: "bu02" },
    { userId: userBu03Lead.id, teamId: "bu03" },
    { userId: userBu04Lead.id, teamId: "bu04" },
    { userId: userSalesLead.id, teamId: "sales-marketing" },
    { userId: userAdmin.id, teamId: "hr-admin" },
  ];
  for (const m of membershipData) {
    await prisma.membership.create({ data: m });
  }
  // ADMIN and CEO bypass per-team Membership checks via canAccessTeam(),
  // so userAdmin/userCeo don't strictly need rows for every team.

  // 4. Standard Tasks — every team gets multiple tasks across all four
  // categories (Finance, Customer, Process/Tech, People), plus a couple of
  // ad-hoc examples per team, so every screen has plenty of real variation.
  const tasksData = [
    // BU01 — North America Retail
    { teamId: "bu01", createdById: userAdmin.id, category: "FINANCE" as const, description: "Reconcile weekly cash position", kpiReference: "Ledger Accuracy %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu01", createdById: userAdmin.id, category: "FINANCE" as const, description: "Review store-level markdown spend", kpiReference: "Markdown Budget %", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "bu01", createdById: userAdmin.id, category: "CUSTOMER" as const, description: "Review top-10 customer health scores", kpiReference: "NPS", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu01", createdById: userAdmin.id, category: "PROCESS_TECH" as const, description: "Audit POS system uptime", kpiReference: "Uptime %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu01", createdById: userAdmin.id, category: "PEOPLE" as const, description: "Review store staffing levels", kpiReference: "Coverage %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu01", createdById: userBu01Lead.id, category: "CUSTOMER" as const, description: "Investigate flagged return spike at store #114", kpiReference: "Return Rate %", frequency: "WEEKLY" as const, source: "ADHOC" as const },

    // BU02 — EMEA Wholesale
    { teamId: "bu02", createdById: userAdmin.id, category: "FINANCE" as const, description: "Reconcile wholesale invoices", kpiReference: "Invoice Accuracy %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu02", createdById: userAdmin.id, category: "CUSTOMER" as const, description: "Follow up with distributor accounts", kpiReference: "Response Time", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu02", createdById: userAdmin.id, category: "CUSTOMER" as const, description: "Review distributor contract renewals", kpiReference: "Renewal Rate %", frequency: "QUARTERLY" as const, source: "STANDARD" as const },
    { teamId: "bu02", createdById: userAdmin.id, category: "PROCESS_TECH" as const, description: "Audit warehouse inventory system", kpiReference: "Sync Accuracy %", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "bu02", createdById: userAdmin.id, category: "PEOPLE" as const, description: "Review regional staffing plan", kpiReference: "Headcount Variance", frequency: "QUARTERLY" as const, source: "STANDARD" as const },
    { teamId: "bu02", createdById: userBu02Lead.id, category: "PROCESS_TECH" as const, description: "Patch customs clearance portal outage", kpiReference: "Uptime %", frequency: "WEEKLY" as const, source: "ADHOC" as const },

    // BU03 — APAC Retail
    { teamId: "bu03", createdById: userAdmin.id, category: "FINANCE" as const, description: "Reconcile regional FX exposure", kpiReference: "FX Variance %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu03", createdById: userAdmin.id, category: "CUSTOMER" as const, description: "Review store-level customer feedback", kpiReference: "CSAT", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu03", createdById: userAdmin.id, category: "PROCESS_TECH" as const, description: "Audit regional POS integration", kpiReference: "Sync Accuracy %", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "bu03", createdById: userAdmin.id, category: "PEOPLE" as const, description: "Review seasonal staffing plan", kpiReference: "Coverage %", frequency: "QUARTERLY" as const, source: "STANDARD" as const },
    { teamId: "bu03", createdById: userAdmin.id, category: "PEOPLE" as const, description: "Review new-hire onboarding completion", kpiReference: "Onboarding Completion %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu03", createdById: userBu03Lead.id, category: "FINANCE" as const, description: "Chase overdue distributor payment", kpiReference: "DSO", frequency: "WEEKLY" as const, source: "ADHOC" as const },

    // BU04 — LATAM Distribution
    { teamId: "bu04", createdById: userAdmin.id, category: "FINANCE" as const, description: "Reconcile distributor settlements", kpiReference: "Settlement Accuracy %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu04", createdById: userAdmin.id, category: "CUSTOMER" as const, description: "Follow up on distributor escalations", kpiReference: "Response Time", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu04", createdById: userAdmin.id, category: "PROCESS_TECH" as const, description: "Audit logistics tracking system", kpiReference: "Sync Accuracy %", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "bu04", createdById: userAdmin.id, category: "PROCESS_TECH" as const, description: "Review customs documentation backlog", kpiReference: "Backlog Count", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu04", createdById: userAdmin.id, category: "PEOPLE" as const, description: "Review warehouse staffing levels", kpiReference: "Coverage %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu04", createdById: userBu04Lead.id, category: "CUSTOMER" as const, description: "Expedite delayed shipment for key account", kpiReference: "On-Time Delivery %", frequency: "WEEKLY" as const, source: "ADHOC" as const },

    // Engineering
    { teamId: "engineering", createdById: userEngLead.id, category: "FINANCE" as const, description: "Review cloud infrastructure spend", kpiReference: "Budget Variance", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "engineering", createdById: userEngLead.id, category: "CUSTOMER" as const, description: "Triage customer-reported bugs", kpiReference: "Bug Resolution SLA", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "engineering", createdById: userEngLead.id, category: "PROCESS_TECH" as const, description: "Deploy weekly staging build", kpiReference: "Uptime %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "engineering", createdById: userEngLead.id, category: "PROCESS_TECH" as const, description: "Review dependency vulnerability scan", kpiReference: "Critical CVEs Open", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "engineering", createdById: userEngLead.id, category: "PEOPLE" as const, description: "Conduct 1-on-1 development reviews", kpiReference: "Retention Rate", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "engineering", createdById: userEngLead.id, category: "PROCESS_TECH" as const, description: "Hotfix production auth regression", kpiReference: "Incident Count", frequency: "WEEKLY" as const, source: "ADHOC" as const },

    // HR & Admin
    { teamId: "hr-admin", createdById: userAdmin.id, category: "FINANCE" as const, description: "Verify payroll run accuracy", kpiReference: "Payroll Accuracy %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "hr-admin", createdById: userAdmin.id, category: "CUSTOMER" as const, description: "Respond to employee HR tickets", kpiReference: "Ticket Response Time", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "hr-admin", createdById: userAdmin.id, category: "PROCESS_TECH" as const, description: "Audit HRIS data integrity", kpiReference: "Data Accuracy %", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "hr-admin", createdById: userAdmin.id, category: "PEOPLE" as const, description: "Verify team timesheet submissions", kpiReference: "Payroll Compliance %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "hr-admin", createdById: userAdmin.id, category: "PEOPLE" as const, description: "Review open headcount requisitions", kpiReference: "Time to Fill", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "hr-admin", createdById: userFinanceLead.id, category: "FINANCE" as const, description: "Resolve benefits enrollment escalation", kpiReference: "Ticket Response Time", frequency: "WEEKLY" as const, source: "ADHOC" as const },

    // Finance
    { teamId: "finance", createdById: userFinanceLead.id, category: "FINANCE" as const, description: "Close weekly management accounts", kpiReference: "Close Accuracy %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "finance", createdById: userFinanceLead.id, category: "CUSTOMER" as const, description: "Resolve billing disputes", kpiReference: "Dispute Resolution Time", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "finance", createdById: userFinanceLead.id, category: "PROCESS_TECH" as const, description: "Audit ERP reconciliation jobs", kpiReference: "Job Success Rate", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "finance", createdById: userFinanceLead.id, category: "PEOPLE" as const, description: "Review finance team workload", kpiReference: "Overtime Hours", frequency: "QUARTERLY" as const, source: "STANDARD" as const },
    { teamId: "finance", createdById: userEngLead.id, category: "FINANCE" as const, description: "Investigate cloud invoice discrepancy", kpiReference: "Budget Variance", frequency: "WEEKLY" as const, source: "ADHOC" as const },

    // Sales & Marketing
    { teamId: "sales-marketing", createdById: userSalesLead.id, category: "FINANCE" as const, description: "Reconcile campaign spend vs. budget", kpiReference: "Budget Variance", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "sales-marketing", createdById: userSalesLead.id, category: "CUSTOMER" as const, description: "Follow up with qualified leads", kpiReference: "Lead Response Time", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "sales-marketing", createdById: userSalesLead.id, category: "PROCESS_TECH" as const, description: "Audit CRM data quality", kpiReference: "Data Completeness %", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "sales-marketing", createdById: userSalesLead.id, category: "PEOPLE" as const, description: "Review quarterly sales team targets", kpiReference: "Quota Attainment %", frequency: "QUARTERLY" as const, source: "STANDARD" as const },
    { teamId: "sales-marketing", createdById: userBu01Lead.id, category: "CUSTOMER" as const, description: "Prep win-back offer for churned key account", kpiReference: "Lead Response Time", frequency: "WEEKLY" as const, source: "ADHOC" as const },
  ];

  const weekStarts = WEEK_OFFSETS_OLDEST_FIRST.map((weeksAgo) => ({ weeksAgo, date: mondayOf(weeksAgo) }));
  const currentWeekStart = weekStarts[weekStarts.length - 1].date;

  let instanceCount = 0;

  for (const task of tasksData) {
    const created = await prisma.task.create({
      data: {
        teamId: task.teamId,
        createdById: task.createdById,
        category: task.category,
        description: task.description,
        kpiReference: task.kpiReference,
        frequency: task.frequency,
        source: task.source,
      },
    });

    // Ad-hoc tasks only ever existed in the current week (they're not
    // carried forward on reset — see BRD User Journey 6).
    if (task.source === "ADHOC") {
      const status = Math.random() < 0.6 ? "COMPLETE" : "INCOMPLETE";
      await prisma.taskInstance.create({
        data: {
          taskId: created.id,
          weekStartDate: currentWeekStart,
          status,
          isActivated: status === "INCOMPLETE",
          completedAt: status === "COMPLETE" ? new Date() : null,
          completedById: status === "COMPLETE" ? task.createdById : null,
        },
      });
      instanceCount++;
      continue;
    }

    // Standard tasks get an instance in every past week where they were due:
    // WEEKLY -> every week, MONTHLY -> every 4th week, QUARTERLY -> oldest
    // week only (out of a 5-week window, that's the closest stand-in for
    // "once a quarter").
    for (const { weeksAgo, date } of weekStarts) {
      const due =
        task.frequency === "WEEKLY" ||
        (task.frequency === "MONTHLY" && weeksAgo % 4 === 0) ||
        (task.frequency === "QUARTERLY" && weeksAgo === WEEK_OFFSETS_OLDEST_FIRST[0]);

      if (!due) continue;

      // Older weeks skew more complete (work caught up over time); current
      // week skews toward in-progress, so the dashboard shows real variation.
      const isCurrentWeek = weeksAgo === 0;
      const completeThreshold = isCurrentWeek ? 0.45 : 0.85;
      const rand = Math.random();
      const status = rand < completeThreshold ? "COMPLETE" : "INCOMPLETE";
      const isActivated = status === "INCOMPLETE" && rand > 0.3;

      await prisma.taskInstance.create({
        data: {
          taskId: created.id,
          weekStartDate: date,
          status,
          isActivated,
          completedAt: status === "COMPLETE" ? date : null,
          completedById: status === "COMPLETE" ? task.createdById : null,
        },
      });
      instanceCount++;
    }
  }

  console.log(
    `Seeded ${teams.length} teams, 10 users, ${membershipData.length} memberships, ${tasksData.length} tasks, ${instanceCount} task instances across ${weekStarts.length} weeks.`
  );
}