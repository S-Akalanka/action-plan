import { prisma } from "./prisma";

// How many weeks of history to generate, oldest first. 0 = current week.
const WEEK_OFFSETS_OLDEST_FIRST = [4, 3, 2, 1, 0];
const MAX_WEEKS_AGO = WEEK_OFFSETS_OLDEST_FIRST[0];

function toUtcMidnight(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m, d));
}

function mondayOf(weeksAgo: number): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) - weeksAgo * 7;
  const local = new Date(now.getFullYear(), now.getMonth(), diff);
  return toUtcMidnight(local.getFullYear(), local.getMonth(), local.getDate());
}

function daysFromToday(days: number): Date {
  const now = new Date();
  const local = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
  return toUtcMidnight(local.getFullYear(), local.getMonth(), local.getDate());
}

function weekNumberFor(weeksAgo: number): number {
  return MAX_WEEKS_AGO - weeksAgo + 1;
}
function deadlineFor(frequency: "ONCE" | "WEEKLY" | "BI_WEEKLY" | "MONTHLY" | "QUARTERLY"): Date {
  switch (frequency) {
    case "ONCE":
      return daysFromToday(3);
    case "WEEKLY":
      return daysFromToday(90);
    case "BI_WEEKLY":
      return daysFromToday(120);
    case "MONTHLY":
      return daysFromToday(180);
    case "QUARTERLY":
      return daysFromToday(365);
  }
}

const OVERDUE_COMMENTS = [
  "Blocked pending sign-off from another team.",
  "Delayed due to competing priorities this week.",
  "Data source was unavailable, following up.",
  "Owner was out; picking back up next cycle.",
  "Carried over - deprioritized for an urgent request.",
];

const CARRYOVER_COMMENTS = [
  "Still catching up on last week's item before starting this week's.",
  "Picking this up now - last week's instance slipped.",
  "Continuing from last week; wasn't finished in time.",
];

const LATE_COMPLETION_COMMENTS = [
  "Finished this, but past the deadline - resourcing was tight this cycle.",
  "Completed late; waiting on a dependency that came through after the deadline.",
  "Done now. Missed the deadline due to an unplanned outage.",
];

type WeekStatus = "COMPLETE" | "IN_PROGRESS" | "INCOMPLETE";
const WEEK_PROFILES: Record<number, WeekStatus>[] = [
  { 4: "COMPLETE", 3: "IN_PROGRESS", 2: "COMPLETE", 1: "INCOMPLETE", 0: "INCOMPLETE" },
  { 4: "COMPLETE", 3: "COMPLETE", 2: "IN_PROGRESS", 1: "COMPLETE", 0: "INCOMPLETE" },
  { 4: "IN_PROGRESS", 3: "COMPLETE", 2: "COMPLETE", 1: "INCOMPLETE", 0: "INCOMPLETE" },
];

const PAST_DEADLINE_PROFILE: Record<number, WeekStatus> = {
  4: "COMPLETE",
  3: "COMPLETE",
  2: "COMPLETE",
  1: "INCOMPLETE",
  0: "INCOMPLETE",
};

const SKIP_CURRENT_WEEK_EVERY_NTH = 4;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function seedDatabase() {
  console.log("Resetting and seeding database with teams, users, memberships, and tasks...");

  // 0. Clear existing data - child tables first to respect FK constraints.
  await prisma.taskInstance.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.membership.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.team.deleteMany({});

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

  const membershipData = [
    // 3 teams
    { userId: userEngLead.id, teamId: "engineering" },
    { userId: userEngLead.id, teamId: "bu01" },
    { userId: userEngLead.id, teamId: "finance" },

    { userId: userFloatAnalyst.id, teamId: "bu02" },
    { userId: userFloatAnalyst.id, teamId: "bu03" },
    { userId: userFloatAnalyst.id, teamId: "bu04" },

    { userId: userBu01Lead.id, teamId: "bu01" },
    { userId: userBu01Lead.id, teamId: "sales-marketing" },

    { userId: userFinanceLead.id, teamId: "finance" },
    { userId: userFinanceLead.id, teamId: "hr-admin" },

    { userId: userBu02Lead.id, teamId: "bu02" },
    { userId: userBu03Lead.id, teamId: "bu03" },
    { userId: userBu04Lead.id, teamId: "bu04" },
    { userId: userSalesLead.id, teamId: "sales-marketing" },
    { userId: userAdmin.id, teamId: "hr-admin" },
  ];
  for (const m of membershipData) {
    await prisma.membership.create({ data: m });
  }

  const tasksData = [
    // BU01 - North America Retail
    { teamId: "bu01", createdById: userAdmin.id, category: "FINANCE" as const, description: "Reconcile weekly cash position", kpiReference: "Ledger Accuracy %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu01", createdById: userAdmin.id, category: "FINANCE" as const, description: "Review store-level markdown spend", kpiReference: "Markdown Budget %", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "bu01", createdById: userAdmin.id, category: "CUSTOMER" as const, description: "Review top-10 customer health scores", kpiReference: "NPS", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu01", createdById: userAdmin.id, category: "PROCESS_TECH" as const, description: "Audit POS system uptime", kpiReference: "Uptime %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu01", createdById: userAdmin.id, category: "PEOPLE" as const, description: "Review store staffing levels", kpiReference: "Coverage %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu01", createdById: userBu01Lead.id, category: "CUSTOMER" as const, description: "Investigate flagged return spike at store #114", kpiReference: "Return Rate %", frequency: "ONCE" as const, source: "ADHOC" as const },

    // BU02 - EMEA Wholesale
    { teamId: "bu02", createdById: userAdmin.id, category: "FINANCE" as const, description: "Reconcile wholesale invoices", kpiReference: "Invoice Accuracy %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu02", createdById: userAdmin.id, category: "CUSTOMER" as const, description: "Follow up with distributor accounts", kpiReference: "Response Time", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu02", createdById: userAdmin.id, category: "CUSTOMER" as const, description: "Review distributor contract renewals", kpiReference: "Renewal Rate %", frequency: "QUARTERLY" as const, source: "STANDARD" as const },
    { teamId: "bu02", createdById: userAdmin.id, category: "PROCESS_TECH" as const, description: "Audit warehouse inventory system", kpiReference: "Sync Accuracy %", frequency: "MONTHLY" as const, source: "STANDARD" as const, pastDeadline: true },
    { teamId: "bu02", createdById: userAdmin.id, category: "PEOPLE" as const, description: "Review regional staffing plan", kpiReference: "Headcount Variance", frequency: "QUARTERLY" as const, source: "STANDARD" as const },
    { teamId: "bu02", createdById: userBu02Lead.id, category: "PROCESS_TECH" as const, description: "Patch customs clearance portal outage", kpiReference: "Uptime %", frequency: "ONCE" as const, source: "ADHOC" as const },

    // BU03 - APAC Retail
    { teamId: "bu03", createdById: userAdmin.id, category: "FINANCE" as const, description: "Reconcile regional FX exposure", kpiReference: "FX Variance %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu03", createdById: userAdmin.id, category: "CUSTOMER" as const, description: "Review store-level customer feedback", kpiReference: "CSAT", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu03", createdById: userAdmin.id, category: "PROCESS_TECH" as const, description: "Audit regional POS integration", kpiReference: "Sync Accuracy %", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "bu03", createdById: userAdmin.id, category: "PEOPLE" as const, description: "Review seasonal staffing plan", kpiReference: "Coverage %", frequency: "QUARTERLY" as const, source: "STANDARD" as const },
    { teamId: "bu03", createdById: userAdmin.id, category: "PEOPLE" as const, description: "Review new-hire onboarding completion", kpiReference: "Onboarding Completion %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu03", createdById: userBu03Lead.id, category: "FINANCE" as const, description: "Chase overdue distributor payment", kpiReference: "DSO", frequency: "ONCE" as const, source: "ADHOC" as const },

    // BU04 - LATAM Distribution
    { teamId: "bu04", createdById: userAdmin.id, category: "FINANCE" as const, description: "Reconcile distributor settlements", kpiReference: "Settlement Accuracy %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu04", createdById: userAdmin.id, category: "CUSTOMER" as const, description: "Follow up on distributor escalations", kpiReference: "Response Time", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu04", createdById: userAdmin.id, category: "PROCESS_TECH" as const, description: "Audit logistics tracking system", kpiReference: "Sync Accuracy %", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "bu04", createdById: userAdmin.id, category: "PROCESS_TECH" as const, description: "Review customs documentation backlog", kpiReference: "Backlog Count", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu04", createdById: userAdmin.id, category: "PEOPLE" as const, description: "Review warehouse staffing levels", kpiReference: "Coverage %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "bu04", createdById: userBu04Lead.id, category: "CUSTOMER" as const, description: "Expedite delayed shipment for key account", kpiReference: "On-Time Delivery %", frequency: "ONCE" as const, source: "ADHOC" as const },

    // Engineering
    { teamId: "engineering", createdById: userEngLead.id, category: "FINANCE" as const, description: "Review cloud infrastructure spend", kpiReference: "Budget Variance", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "engineering", createdById: userEngLead.id, category: "CUSTOMER" as const, description: "Triage customer-reported bugs", kpiReference: "Bug Resolution SLA", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "engineering", createdById: userEngLead.id, category: "PROCESS_TECH" as const, description: "Deploy weekly staging build", kpiReference: "Uptime %", frequency: "WEEKLY" as const, source: "STANDARD" as const, pastDeadline: true },
    { teamId: "engineering", createdById: userEngLead.id, category: "PROCESS_TECH" as const, description: "Review dependency vulnerability scan", kpiReference: "Critical CVEs Open", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "engineering", createdById: userEngLead.id, category: "PEOPLE" as const, description: "Conduct 1-on-1 development reviews", kpiReference: "Retention Rate", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "engineering", createdById: userEngLead.id, category: "PROCESS_TECH" as const, description: "Hotfix production auth regression", kpiReference: "Incident Count", frequency: "ONCE" as const, source: "ADHOC" as const },

    // HR & Admin
    { teamId: "hr-admin", createdById: userAdmin.id, category: "FINANCE" as const, description: "Verify payroll run accuracy", kpiReference: "Payroll Accuracy %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "hr-admin", createdById: userAdmin.id, category: "CUSTOMER" as const, description: "Respond to employee HR tickets", kpiReference: "Ticket Response Time", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "hr-admin", createdById: userAdmin.id, category: "PROCESS_TECH" as const, description: "Audit HRIS data integrity", kpiReference: "Data Accuracy %", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "hr-admin", createdById: userAdmin.id, category: "PEOPLE" as const, description: "Verify team timesheet submissions", kpiReference: "Payroll Compliance %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "hr-admin", createdById: userAdmin.id, category: "PEOPLE" as const, description: "Review open headcount requisitions", kpiReference: "Time to Fill", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "hr-admin", createdById: userFinanceLead.id, category: "FINANCE" as const, description: "Resolve benefits enrollment escalation", kpiReference: "Ticket Response Time", frequency: "ONCE" as const, source: "ADHOC" as const },

    // Finance
    { teamId: "finance", createdById: userFinanceLead.id, category: "FINANCE" as const, description: "Close weekly management accounts", kpiReference: "Close Accuracy %", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "finance", createdById: userFinanceLead.id, category: "CUSTOMER" as const, description: "Resolve billing disputes", kpiReference: "Dispute Resolution Time", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "finance", createdById: userFinanceLead.id, category: "PROCESS_TECH" as const, description: "Audit ERP reconciliation jobs", kpiReference: "Job Success Rate", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "finance", createdById: userFinanceLead.id, category: "PEOPLE" as const, description: "Review finance team workload", kpiReference: "Overtime Hours", frequency: "QUARTERLY" as const, source: "STANDARD" as const, pastDeadline: true },
    { teamId: "finance", createdById: userEngLead.id, category: "FINANCE" as const, description: "Investigate cloud invoice discrepancy", kpiReference: "Budget Variance", frequency: "ONCE" as const, source: "ADHOC" as const },

    // Sales & Marketing
    { teamId: "sales-marketing", createdById: userSalesLead.id, category: "FINANCE" as const, description: "Reconcile campaign spend vs. budget", kpiReference: "Budget Variance", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "sales-marketing", createdById: userSalesLead.id, category: "CUSTOMER" as const, description: "Follow up with qualified leads", kpiReference: "Lead Response Time", frequency: "WEEKLY" as const, source: "STANDARD" as const },
    { teamId: "sales-marketing", createdById: userSalesLead.id, category: "PROCESS_TECH" as const, description: "Audit CRM data quality", kpiReference: "Data Completeness %", frequency: "MONTHLY" as const, source: "STANDARD" as const },
    { teamId: "sales-marketing", createdById: userSalesLead.id, category: "PEOPLE" as const, description: "Review quarterly sales team targets", kpiReference: "Quota Attainment %", frequency: "QUARTERLY" as const, source: "STANDARD" as const },
    { teamId: "sales-marketing", createdById: userBu01Lead.id, category: "CUSTOMER" as const, description: "Prep win-back offer for churned key account", kpiReference: "Lead Response Time", frequency: "ONCE" as const, source: "ADHOC" as const },
  ];

  const weekStarts = WEEK_OFFSETS_OLDEST_FIRST.map((weeksAgo) => ({ weeksAgo, date: mondayOf(weeksAgo) }));
  const currentWeekStart = weekStarts[weekStarts.length - 1].date;

  let instanceCount = 0;
  let commentCount = 0;
  let standardTaskIndex = 0;

  for (const task of tasksData) {
    const isPastDeadline = "pastDeadline" in task && task.pastDeadline === true;
    const deadline = isPastDeadline ? daysFromToday(-10) : deadlineFor(task.frequency);

    const created = await prisma.task.create({
      data: {
        teamId: task.teamId,
        createdById: task.createdById,
        category: task.category,
        description: task.description,
        details: isPastDeadline
          ? `Recurs ${task.frequency}; deadline intentionally set in the past to demo late-completion handling. Seeded across Week 1–Week ${weekNumberFor(0)} (oldest→current).`
          : `Recurs ${task.frequency}; seeded across Week 1–Week ${weekNumberFor(0)} (oldest→current).`,
        kpiReference: task.kpiReference,
        frequency: task.frequency,
        source: task.source,
        deadline,
      },
    });

    // Ad-hoc tasks only ever existed in the current week (they're not
    // carried forward on reset - see BRD User Journey 6). Current week is
    // always INCOMPLETE, same rule as everything else this week.
    if (task.source === "ADHOC") {
      await prisma.taskInstance.create({
        data: {
          taskId: created.id,
          weekStartDate: currentWeekStart,
          status: "INCOMPLETE",
          isActivated: true,
          completedAt: null,
          completedById: null,
          comment: null,
          commentedAt: null,
          commentedById: null,
          createdAt: currentWeekStart,
        },
      });
      instanceCount++;
      continue;
    }

    const taskIdx = standardTaskIndex;
    const profile = isPastDeadline
      ? PAST_DEADLINE_PROFILE
      : WEEK_PROFILES[taskIdx % WEEK_PROFILES.length];
    const skipCurrentWeek = !isPastDeadline && taskIdx % SKIP_CURRENT_WEEK_EVERY_NTH === 0;
    const explainOverdue = isPastDeadline ? true : taskIdx % 2 === 0;
    standardTaskIndex++;

    let previousWeekAgo1Status: "COMPLETE" | "INCOMPLETE" | null = null;

    for (const { weeksAgo, date } of weekStarts) {
      const due =
        task.frequency === "WEEKLY" ||
        (task.frequency === "MONTHLY" && weeksAgo % 4 === 0) ||
        (task.frequency === "QUARTERLY" && weeksAgo === MAX_WEEKS_AGO);

      if (!due) continue;

      const isCurrentWeek = weeksAgo === 0;

      if (isCurrentWeek && skipCurrentWeek) continue;

      const weekPattern = profile[weeksAgo] ?? "INCOMPLETE";
      const status: "COMPLETE" | "INCOMPLETE" = weekPattern === "COMPLETE" ? "COMPLETE" : "INCOMPLETE";
      const isActivated = weekPattern === "IN_PROGRESS";

      let comment: string | null = null;
      let commentedAt: Date | null = null;
      let commentedById: string | null = null;

      // Past week still INCOMPLETE has missed its window - needs an excuse,
      // but only for some tasks (see explainOverdue above); others are left
      // without one on purpose.
      if (status === "INCOMPLETE" && !isCurrentWeek && explainOverdue) {
        comment = pick(OVERDUE_COMMENTS);
        commentedAt = new Date();
        commentedById = task.createdById;
        commentCount++;
      }

      // Last week (weeksAgo === 1) was INCOMPLETE -> this week's instance
      // (weeksAgo === 0) gets a carryover note explaining the backlog.
      if (isCurrentWeek && previousWeekAgo1Status === "INCOMPLETE" && !comment) {
        comment = pick(CARRYOVER_COMMENTS);
        commentedAt = new Date();
        commentedById = task.createdById;
        commentCount++;
      }

      // Completed, but this task's deadline has already passed -> excuse.
      if (status === "COMPLETE" && isPastDeadline && !comment) {
        comment = pick(LATE_COMPLETION_COMMENTS);
        commentedAt = new Date();
        commentedById = task.createdById;
        commentCount++;
      }

      await prisma.taskInstance.create({
        data: {
          taskId: created.id,
          weekStartDate: date,
          status,
          isActivated,
          completedAt: status === "COMPLETE" ? date : null,
          completedById: status === "COMPLETE" ? task.createdById : null,
          comment,
          commentedAt,
          commentedById,
          createdAt: date,
        },
      });
      instanceCount++;

      if (weeksAgo === 1) previousWeekAgo1Status = status;
    }
  }

  console.log(
    `Seeded ${teams.length} teams, 10 users, ${membershipData.length} memberships, ${tasksData.length} tasks, ${instanceCount} task instances across ${weekStarts.length} weeks (${commentCount} have comments).`
  );
}