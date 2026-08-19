import { prisma } from "./prisma";

// Use fixed UTC dates so seed data is deterministic and compatible with the
// database's date-only fields.
function utcDate(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m - 1, d));
}

const WEEK_1_START = utcDate(2026, 8, 3); // oldest
const WEEK_2_START = utcDate(2026, 8, 10);
const WEEK_3_START = utcDate(2026, 8, 17); // current week, today is Mon 17 Aug 2026
const CURRENT_WEEK_START = WEEK_3_START;

function daysFromWeek3(days: number): Date {
  const d = new Date(WEEK_3_START);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function deadlineFor(frequency: "ONCE" | "WEEKLY"): Date {
  return frequency === "ONCE" ? daysFromWeek3(3) : daysFromWeek3(90);
}

// Weekly fixtures cover completed, excused, and overdue outcomes.
const COMPLETE = { status: "COMPLETE" as const, comment: null as string | null };
const OVERDUE = { status: "INCOMPLETE" as const, comment: null as string | null };
function excused(comment: string) {
  return { status: "INCOMPLETE" as const, comment };
}

type WeekOutcome = { status: "COMPLETE" | "INCOMPLETE"; comment: string | null };
type WeeklyTask = {
  teamId: string;
  createdById: string;
  category: "FINANCE" | "CUSTOMER" | "PROCESS_TECH" | "PEOPLE";
  description: string;
  kpiReference: string;
  week1: WeekOutcome;
  week2: WeekOutcome;
  skipWeek3?: boolean;
  pastDeadline?: boolean;
};
type OnceTask = {
  teamId: string;
  createdById: string;
  category: "FINANCE" | "CUSTOMER" | "PROCESS_TECH" | "PEOPLE";
  description: string;
  kpiReference: string;
};

export async function seedDatabase() {
  console.log("Resetting and seeding database with teams, users, memberships, and tasks...");

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

  const userEngLead = await prisma.user.create({ data: { microsoftId: "seed-engineering-lead", name: "Engineering Lead", role: "TEAM" } });
  const userBu01Lead = await prisma.user.create({ data: { microsoftId: "seed-bu01-lead", name: "BU01 Lead", role: "TEAM" } });
  const userBu02Lead = await prisma.user.create({ data: { microsoftId: "seed-bu02-lead", name: "BU02 Lead", role: "TEAM" } });
  const userBu03Lead = await prisma.user.create({ data: { microsoftId: "seed-bu03-lead", name: "BU03 Lead", role: "TEAM" } });
  const userBu04Lead = await prisma.user.create({ data: { microsoftId: "seed-bu04-lead", name: "BU04 Lead", role: "TEAM" } });
  const userFinanceLead = await prisma.user.create({ data: { microsoftId: "seed-finance-lead", name: "Finance Lead", role: "TEAM" } });
  const userSalesLead = await prisma.user.create({ data: { microsoftId: "seed-sales-lead", name: "Sales Lead", role: "TEAM" } });
  const userFloatAnalyst = await prisma.user.create({ data: { microsoftId: "seed-float-analyst", name: "Cross-BU Analyst", role: "TEAM" } });
  const userAdmin = await prisma.user.create({ data: { microsoftId: "seed-hr-manager", name: "HR Manager", role: "ADMIN" } });
  const userCeo = await prisma.user.create({ data: { microsoftId: "seed-ceo-office", name: "CEO", role: "CEO" } });

  const membershipData = [
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

  const weeklyTasks: WeeklyTask[] = [
    // BU01
    { teamId: "bu01", createdById: userAdmin.id, category: "FINANCE", description: "Reconcile weekly cash position", kpiReference: "Ledger Accuracy %", week1: COMPLETE, week2: COMPLETE },
    { teamId: "bu01", createdById: userAdmin.id, category: "FINANCE", description: "Review store-level markdown spend", kpiReference: "Markdown Budget %", week1: excused("Blocked pending sign-off from another team."), week2: COMPLETE },
    { teamId: "bu01", createdById: userAdmin.id, category: "CUSTOMER", description: "Review top-10 customer health scores", kpiReference: "NPS", week1: COMPLETE, week2: COMPLETE },
    { teamId: "bu01", createdById: userAdmin.id, category: "PROCESS_TECH", description: "Audit POS system uptime", kpiReference: "Uptime %", week1: COMPLETE, week2: OVERDUE },
    { teamId: "bu01", createdById: userAdmin.id, category: "PEOPLE", description: "Review store staffing levels", kpiReference: "Coverage %", week1: COMPLETE, week2: COMPLETE },

    // BU02
    { teamId: "bu02", createdById: userAdmin.id, category: "FINANCE", description: "Reconcile wholesale invoices", kpiReference: "Invoice Accuracy %", week1: COMPLETE, week2: COMPLETE },
    { teamId: "bu02", createdById: userAdmin.id, category: "CUSTOMER", description: "Follow up with distributor accounts", kpiReference: "Response Time", week1: COMPLETE, week2: excused("Delayed due to competing priorities this week.") },
    { teamId: "bu02", createdById: userAdmin.id, category: "CUSTOMER", description: "Review distributor contract renewals", kpiReference: "Renewal Rate %", week1: COMPLETE, week2: COMPLETE },
    { teamId: "bu02", createdById: userAdmin.id, category: "PROCESS_TECH", description: "Audit warehouse inventory system", kpiReference: "Sync Accuracy %", week1: COMPLETE, week2: excused("Finished late — waiting on a dependency that came through after the deadline."), pastDeadline: true },
    { teamId: "bu02", createdById: userAdmin.id, category: "PEOPLE", description: "Review regional staffing plan", kpiReference: "Headcount Variance", week1: COMPLETE, week2: OVERDUE },

    // BU03
    { teamId: "bu03", createdById: userAdmin.id, category: "FINANCE", description: "Reconcile regional FX exposure", kpiReference: "FX Variance %", week1: excused("Data source was unavailable, following up."), week2: COMPLETE },
    { teamId: "bu03", createdById: userAdmin.id, category: "CUSTOMER", description: "Review store-level customer feedback", kpiReference: "CSAT", week1: COMPLETE, week2: COMPLETE },
    { teamId: "bu03", createdById: userAdmin.id, category: "PROCESS_TECH", description: "Audit regional POS integration", kpiReference: "Sync Accuracy %", week1: COMPLETE, week2: COMPLETE },
    { teamId: "bu03", createdById: userAdmin.id, category: "PEOPLE", description: "Review seasonal staffing plan", kpiReference: "Coverage %", week1: COMPLETE, week2: OVERDUE, skipWeek3: true },
    { teamId: "bu03", createdById: userAdmin.id, category: "PEOPLE", description: "Review new-hire onboarding completion", kpiReference: "Onboarding Completion %", week1: COMPLETE, week2: COMPLETE },

    // BU04
    { teamId: "bu04", createdById: userAdmin.id, category: "FINANCE", description: "Reconcile distributor settlements", kpiReference: "Settlement Accuracy %", week1: COMPLETE, week2: COMPLETE },
    { teamId: "bu04", createdById: userAdmin.id, category: "CUSTOMER", description: "Follow up on distributor escalations", kpiReference: "Response Time", week1: COMPLETE, week2: COMPLETE },
    { teamId: "bu04", createdById: userAdmin.id, category: "PROCESS_TECH", description: "Audit logistics tracking system", kpiReference: "Sync Accuracy %", week1: excused("Owner was out; picking back up next cycle."), week2: COMPLETE },
    { teamId: "bu04", createdById: userAdmin.id, category: "PROCESS_TECH", description: "Review customs documentation backlog", kpiReference: "Backlog Count", week1: COMPLETE, week2: OVERDUE },
    { teamId: "bu04", createdById: userAdmin.id, category: "PEOPLE", description: "Review warehouse staffing levels", kpiReference: "Coverage %", week1: COMPLETE, week2: COMPLETE },

    // Engineering
    { teamId: "engineering", createdById: userEngLead.id, category: "FINANCE", description: "Review cloud infrastructure spend", kpiReference: "Budget Variance", week1: COMPLETE, week2: COMPLETE },
    { teamId: "engineering", createdById: userEngLead.id, category: "CUSTOMER", description: "Triage customer-reported bugs", kpiReference: "Bug Resolution SLA", week1: COMPLETE, week2: excused("Carried over — deprioritized for an urgent request.") },
    { teamId: "engineering", createdById: userEngLead.id, category: "PROCESS_TECH", description: "Deploy weekly staging build", kpiReference: "Uptime %", week1: COMPLETE, week2: excused("Done now. Missed the deadline due to an unplanned outage."), pastDeadline: true },
    { teamId: "engineering", createdById: userEngLead.id, category: "PROCESS_TECH", description: "Review dependency vulnerability scan", kpiReference: "Critical CVEs Open", week1: COMPLETE, week2: COMPLETE },
    { teamId: "engineering", createdById: userEngLead.id, category: "PEOPLE", description: "Conduct 1-on-1 development reviews", kpiReference: "Retention Rate", week1: COMPLETE, week2: OVERDUE },

    // HR & Admin
    { teamId: "hr-admin", createdById: userAdmin.id, category: "FINANCE", description: "Verify payroll run accuracy", kpiReference: "Payroll Accuracy %", week1: COMPLETE, week2: COMPLETE },
    { teamId: "hr-admin", createdById: userAdmin.id, category: "CUSTOMER", description: "Respond to employee HR tickets", kpiReference: "Ticket Response Time", week1: COMPLETE, week2: COMPLETE },
    { teamId: "hr-admin", createdById: userAdmin.id, category: "PROCESS_TECH", description: "Audit HRIS data integrity", kpiReference: "Data Accuracy %", week1: COMPLETE, week2: OVERDUE },
    { teamId: "hr-admin", createdById: userAdmin.id, category: "PEOPLE", description: "Verify team timesheet submissions", kpiReference: "Payroll Compliance %", week1: COMPLETE, week2: COMPLETE },
    { teamId: "hr-admin", createdById: userAdmin.id, category: "PEOPLE", description: "Review open headcount requisitions", kpiReference: "Time to Fill", week1: COMPLETE, week2: COMPLETE },

    // Finance
    { teamId: "finance", createdById: userFinanceLead.id, category: "FINANCE", description: "Close weekly management accounts", kpiReference: "Close Accuracy %", week1: COMPLETE, week2: COMPLETE },
    { teamId: "finance", createdById: userFinanceLead.id, category: "CUSTOMER", description: "Resolve billing disputes", kpiReference: "Dispute Resolution Time", week1: COMPLETE, week2: OVERDUE },
    { teamId: "finance", createdById: userFinanceLead.id, category: "PROCESS_TECH", description: "Audit ERP reconciliation jobs", kpiReference: "Job Success Rate", week1: COMPLETE, week2: COMPLETE },
    { teamId: "finance", createdById: userFinanceLead.id, category: "PEOPLE", description: "Review finance team workload", kpiReference: "Overtime Hours", week1: COMPLETE, week2: excused("Finished this, but past the deadline — resourcing was tight this cycle."), pastDeadline: true },

    // Sales & Marketing
    { teamId: "sales-marketing", createdById: userSalesLead.id, category: "FINANCE", description: "Reconcile campaign spend vs. budget", kpiReference: "Budget Variance", week1: COMPLETE, week2: COMPLETE },
    { teamId: "sales-marketing", createdById: userSalesLead.id, category: "CUSTOMER", description: "Follow up with qualified leads", kpiReference: "Lead Response Time", week1: COMPLETE, week2: OVERDUE },
    { teamId: "sales-marketing", createdById: userSalesLead.id, category: "PROCESS_TECH", description: "Audit CRM data quality", kpiReference: "Data Completeness %", week1: COMPLETE, week2: COMPLETE },
    { teamId: "sales-marketing", createdById: userSalesLead.id, category: "PEOPLE", description: "Review quarterly sales team targets", kpiReference: "Quota Attainment %", week1: COMPLETE, week2: COMPLETE },
  ];

  const onceTasks: OnceTask[] = [
    { teamId: "bu01", createdById: userBu01Lead.id, category: "CUSTOMER", description: "Investigate flagged return spike at store #114", kpiReference: "Return Rate %" },
    { teamId: "bu02", createdById: userBu02Lead.id, category: "PROCESS_TECH", description: "Patch customs clearance portal outage", kpiReference: "Uptime %" },
    { teamId: "bu03", createdById: userBu03Lead.id, category: "FINANCE", description: "Chase overdue distributor payment", kpiReference: "DSO" },
    { teamId: "bu04", createdById: userBu04Lead.id, category: "CUSTOMER", description: "Expedite delayed shipment for key account", kpiReference: "On-Time Delivery %" },
    { teamId: "engineering", createdById: userEngLead.id, category: "PROCESS_TECH", description: "Hotfix production auth regression", kpiReference: "Incident Count" },
    { teamId: "hr-admin", createdById: userFinanceLead.id, category: "FINANCE", description: "Resolve benefits enrollment escalation", kpiReference: "Ticket Response Time" },
    { teamId: "finance", createdById: userEngLead.id, category: "FINANCE", description: "Investigate cloud invoice discrepancy", kpiReference: "Budget Variance" },
    { teamId: "sales-marketing", createdById: userBu01Lead.id, category: "CUSTOMER", description: "Prep win-back offer for churned key account", kpiReference: "Lead Response Time" },
  ];

  let instanceCount = 0;
  let commentCount = 0;
  let overdueCount = 0;

  for (const t of weeklyTasks) {
    const deadline = t.pastDeadline ? daysFromWeek3(-10) : deadlineFor("WEEKLY");

    const created = await prisma.task.create({
      data: {
        teamId: t.teamId,
        createdById: t.createdById,
        category: t.category,
        description: t.description,
        details: `Recurs WEEKLY; seeded across 3 weeks (Week 1 3 Aug – Week 3 17 Aug, current).`,
        kpiReference: t.kpiReference,
        frequency: "WEEKLY",
        source: "STANDARD",
        deadline,
      },
    });

    await prisma.taskInstance.create({
      data: {
        taskId: created.id,
        weekStartDate: WEEK_1_START,
        status: t.week1.status,
        isActivated: false,
        completedAt: t.week1.status === "COMPLETE" ? WEEK_1_START : null,
        completedById: t.week1.status === "COMPLETE" ? t.createdById : null,
        comment: t.week1.comment,
        commentedAt: t.week1.comment ? WEEK_2_START : null,
        commentedById: t.week1.comment ? t.createdById : null,
      },
    });
    instanceCount++;
    if (t.week1.comment) commentCount++;
    if (t.week1.status === "INCOMPLETE" && !t.week1.comment) overdueCount++;

    await prisma.taskInstance.create({
      data: {
        taskId: created.id,
        weekStartDate: WEEK_2_START,
        status: t.week2.status,
        isActivated: false,
        completedAt: t.week2.status === "COMPLETE" ? WEEK_2_START : null,
        completedById: t.week2.status === "COMPLETE" ? t.createdById : null,
        comment: t.week2.comment,
        commentedAt: t.week2.comment ? WEEK_3_START : null,
        commentedById: t.week2.comment ? t.createdById : null,
      },
    });
    instanceCount++;
    if (t.week2.comment) commentCount++;
    if (t.week2.status === "INCOMPLETE" && !t.week2.comment) overdueCount++;

    if (!t.skipWeek3) {
      await prisma.taskInstance.create({
        data: {
          taskId: created.id,
          weekStartDate: WEEK_3_START,
          status: "INCOMPLETE",
          isActivated: false,
          completedAt: null,
          completedById: null,
          comment: null,
          commentedAt: null,
          commentedById: null,
        },
      });
      instanceCount++;
    }
  }

  for (const t of onceTasks) {
    const created = await prisma.task.create({
      data: {
        teamId: t.teamId,
        createdById: t.createdById,
        category: t.category,
        description: t.description,
        details: `Ad-hoc, one-time task. Seeded in the current week (17 Aug).`,
        kpiReference: t.kpiReference,
        frequency: "ONCE",
        source: "ADHOC",
        deadline: deadlineFor("ONCE"),
      },
    });

    await prisma.taskInstance.create({
      data: {
        taskId: created.id,
        weekStartDate: CURRENT_WEEK_START,
        status: "INCOMPLETE",
        isActivated: true,
        completedAt: null,
        completedById: null,
        comment: null,
        commentedAt: null,
        commentedById: null,
      },
    });
    instanceCount++;
  }

  console.log(
    `Seeded ${teams.length} teams, 10 users, ${membershipData.length} memberships, ` +
      `${weeklyTasks.length + onceTasks.length} tasks, ${instanceCount} task instances ` +
      `(${commentCount} with comments, ${overdueCount} genuinely overdue — no comment, INCOMPLETE, week < current).`
  );
}