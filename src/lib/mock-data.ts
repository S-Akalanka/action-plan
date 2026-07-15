import { Landmark, Cog, Headset, Users, Building2, Wrench, ShieldCheck, Megaphone } from "lucide-react";
import type {
  SummaryCardData,
  UnitData,
  TrendPoint,
  TopTeam,
  Task,
  CategoryMeta,
  CategoryKey,
  LedgerTask,
  MyPlanTask,
  Team,
} from "./types";

/**
 * MOCK DATA
 * ---------
 * Everything below is placeholder demo data. When you're ready to hook up
 * a real backend, replace the contents of these exports with data fetched
 * from your API (e.g. in a useEffect + useState, or a server component).
 * The shapes are defined in lib/types.ts — as long as fetched data matches
 * those shapes, no component code needs to change.
 */

// ---------------------------------------------------------------------------
// Dashboard: summary cards
// ---------------------------------------------------------------------------

export const SUMMARY_CARDS: SummaryCardData[] = [
  {
    id: "finance",
    label: "Finance",
    icon: Landmark,
    percent: 82,
    delta: "+4% vs LW",
    trend: "up",
  },
  {
    id: "process-tech",
    label: "Process / Tech",
    icon: Cog,
    percent: 64,
    delta: "-2% vs LW",
    trend: "down",
  },
  {
    id: "customer",
    label: "Customer",
    icon: Headset,
    percent: 91,
    delta: "+12% vs LW",
    trend: "up",
  },
  {
    id: "people",
    label: "People",
    icon: Users,
    percent: 77,
    delta: "On Track",
    trend: "neutral",
  },
];

// ---------------------------------------------------------------------------
// Dashboard: team performance units
// ---------------------------------------------------------------------------

export const UNITS: UnitData[] = [
  {
    id: "bu01",
    code: "BU01",
    overall: 88,
    metrics: [
      { label: "FIN", percent: 94 },
      { label: "TECH", percent: 82 },
      { label: "CUST", percent: 90 },
      { label: "PEOP", percent: 85 },
    ],
  },
  {
    id: "bu02",
    code: "BU02",
    overall: 52,
    metrics: [
      { label: "FIN", percent: 48, severity: "low" },
      { label: "TECH", percent: 31, severity: "critical" },
      { label: "CUST", percent: 65 },
      { label: "PEOP", percent: 64 },
    ],
  },
  {
    id: "bu03",
    code: "BU03",
    overall: 74,
    metrics: [
      { label: "FIN", percent: 70 },
      { label: "TECH", percent: 92 },
      { label: "CUST", percent: 80 },
      { label: "PEOP", percent: 55 },
    ],
  },
  {
    id: "bu04",
    code: "BU04",
    overall: 96,
    metrics: [
      { label: "FIN", percent: 98 },
      { label: "TECH", percent: 96 },
      { label: "CUST", percent: 84 },
      { label: "PEOP", percent: 96 },
    ],
  },
  {
    id: "engineering",
    name: "Engineering",
    overall: 81,
    metrics: [
      { label: "FIN", percent: 75 },
      { label: "TECH", percent: 84 },
      { label: "CUST", percent: 93 },
      { label: "PEOP", percent: 70 },
    ],
  },
  {
    id: "hr-admin",
    name: "HR & Administration",
    overall: 76,
    metrics: [
      { label: "FIN", percent: 62 },
      { label: "TECH", percent: 55 },
      { label: "CUST", percent: 74 },
      { label: "PEOP", percent: 59 },
    ],
  },
  {
    id: "finance-team",
    name: "Finance",
    overall: 61,
    metrics: [
      { label: "FIN", percent: 58 },
      { label: "TECH", percent: 44, severity: "low" },
      { label: "CUST", percent: 65 },
      { label: "PEOP", percent: 75 },
    ],
  },
  {
    id: "sales-marketing",
    name: "Sales & Marketing",
    overall: 85,
    metrics: [
      { label: "FIN", percent: 80 },
      { label: "TECH", percent: 70 },
      { label: "CUST", percent: 92 },
      { label: "PEOP", percent: 74 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Dashboard: completion trend & top teams
// ---------------------------------------------------------------------------

export const TREND_DATA: TrendPoint[] = [
  { label: "W01", percent: 68 },
  { label: "W02", percent: 74 },
  { label: "W03", percent: 79 },
  { label: "W04", percent: 86 },
  { label: "W05 (Current)", percent: 91 },
];

export const TOP_TEAMS: TopTeam[] = [
  { id: "legal-risk", initials: "LR", name: "Legal/Risk", percent: 96 },
  { id: "global-sales", initials: "GS", name: "Global Sales", percent: 88 },
  { id: "sales-marketing", initials: "SM", name: "Sales & Marketing", percent: 85 },
];

// ---------------------------------------------------------------------------
// Action Plans: categories & tasks
// ---------------------------------------------------------------------------

export const CATEGORIES: CategoryMeta[] = [
  { key: "Finance", icon: Landmark, percent: 70 },
  { key: "Customer", icon: Headset, percent: 50 },
  { key: "Process/Tech", icon: Cog, percent: 85 },
  { key: "People", icon: Users, percent: 40 },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: "t1",
    title: "Reduce operational overhead in regional branches",
    kpi: ">95% Completion",
    frequency: "Monthly",
    category: "Finance",
    completed: false,
    active: true,
  },
  {
    id: "t2",
    title: "Quarterly audit of procurement expenditures",
    kpi: "Zero Discrepancies",
    frequency: "Quarterly",
    category: "Finance",
    completed: true,
    active: false,
  },
  {
    id: "t3",
    title: "Weekly response time monitoring for Tier 1 tickets",
    kpi: "<2hr Response",
    frequency: "Weekly",
    category: "Customer",
    completed: false,
    active: true,
  },
  {
    id: "t4",
    title: "Migrate legacy reporting to real-time dashboards",
    kpi: "100% Real-time",
    frequency: "Monthly",
    category: "Process/Tech",
    completed: false,
    active: true,
  },
  {
    id: "t5",
    title: "Monthly leadership coaching for BU01 team leads",
    kpi: "100% On-time",
    frequency: "Monthly",
    category: "People",
    completed: true,
    active: true,
  },
];

// ---------------------------------------------------------------------------
// Task Ledger: section titles & tasks
// ---------------------------------------------------------------------------

export const CATEGORY_SECTION_TITLES: Record<CategoryKey, string> = {
  Finance: "Finance & Allocation",
  Customer: "Customer & Market",
  "Process/Tech": "Process & Tech",
  People: "People & Talent",
};

export const LEDGER_TASKS: LedgerTask[] = [
  {
    id: "l1",
    title: "Finalize Q3 Budget Allocation",
    category: "Finance",
    statusNote: "Starts Oct 10",
    kpi: "OPEX Target",
    frequency: "Weekly",
    completed: false,
    active: true,
    ownerInitials: "SM",
    ownerTeam: "Finance Core",
    ownerColor: "#3B82F6",
  },
  {
    id: "l2",
    title: "Audit Supply Chain Invoices",
    category: "Finance",
    statusNote: "Completed Oct 02",
    kpi: "Cost Reduction",
    frequency: "Monthly",
    completed: true,
    active: false,
    ownerInitials: "AL",
    ownerTeam: "Operations",
    ownerColor: "#6B7280",
  },
  {
    id: "l3",
    title: "Vendor Contract Renewal Review",
    category: "Finance",
    statusNote: "Starts Oct 20",
    kpi: "Contract Compliance",
    frequency: "Quarterly",
    completed: false,
    active: true,
    ownerInitials: "FC",
    ownerTeam: "Finance Core",
    ownerColor: "#3B82F6",
  },
  {
    id: "l4",
    title: "Review CSAT Survey Feedback Q3",
    category: "Customer",
    statusNote: "Starts Oct 10",
    kpi: "NPS Score",
    frequency: "Quarterly",
    completed: false,
    active: true,
    ownerInitials: "JR",
    ownerTeam: "Client Success",
    ownerColor: "#16233F",
    priority: "High",
  },
  {
    id: "l5",
    title: "Cloud Migration Phase 2",
    category: "Process/Tech",
    statusNote: "Starts Oct 15",
    kpi: "System Uptime",
    frequency: "Monthly",
    completed: false,
    active: true,
    ownerInitials: "IT",
    ownerTeam: "Technology",
    ownerColor: "#38BDF8",
  },
  {
    id: "l6",
    title: "Q4 Performance Reviews",
    category: "People",
    statusNote: "Starts Nov 01",
    kpi: "Review Completion",
    frequency: "Quarterly",
    completed: false,
    active: true,
    ownerInitials: "HR",
    ownerTeam: "People Ops",
    ownerColor: "#A855F7",
  },
  {
    id: "l7",
    title: "Leadership Training Program",
    category: "People",
    statusNote: "Starts Oct 20",
    kpi: "Certification Rate",
    frequency: "Monthly",
    completed: false,
    active: true,
    ownerInitials: "LD",
    ownerTeam: "Learning & Development",
    ownerColor: "#F97316",
  },
];

// ---------------------------------------------------------------------------
// My Action Plan: teams & their weekly tasks
// ---------------------------------------------------------------------------

export const TEAMS: Team[] = [
  { id: "bu01", label: "BU01 · North America Retail", icon: Building2 },
  { id: "bu02", label: "BU02 · EMEA Wholesale", icon: Building2 },
  { id: "engineering", label: "Engineering", icon: Wrench },
  { id: "hr-admin", label: "HR & Admin", icon: ShieldCheck },
  { id: "sales-marketing", label: "Sales & Marketing", icon: Megaphone },
];

export const MY_PLAN_TASKS: MyPlanTask[] = [
  // --- BU01 · North America Retail ---
  {
    id: "m1",
    teamId: "bu01",
    desc: "Reconcile weekly cash position",
    category: "Finance",
    kpi: "Ledger Accuracy %",
    frequency: "Weekly",
    done: true,
    completedAt: "Mon 09:14",
  },
  {
    id: "m2",
    teamId: "bu01",
    desc: "Submit variance commentary",
    category: "Finance",
    kpi: "Variance Reporting",
    frequency: "Weekly",
    done: false,
  },
  {
    id: "m3",
    teamId: "bu01",
    desc: "Review top-10 customer health scores",
    category: "Customer",
    kpi: "NPS",
    frequency: "Weekly",
    done: true,
    completedAt: "Tue 11:02",
  },
  {
    id: "m4",
    teamId: "bu01",
    desc: "Follow up on escalated tickets",
    category: "Customer",
    kpi: "Ticket Aging",
    frequency: "Weekly",
    done: false,
  },
  {
    id: "m5",
    teamId: "bu01",
    desc: "Sprint retro action items closed",
    category: "Process/Tech",
    kpi: "Retro Closure",
    frequency: "Weekly",
    done: false,
  },
  {
    id: "m6",
    teamId: "bu01",
    desc: "Deploy monthly patch bundle",
    category: "Process/Tech",
    kpi: "Patch SLA",
    frequency: "Monthly",
    done: false,
  },
  {
    id: "m7",
    teamId: "bu01",
    desc: "Complete 1:1 with each direct report",
    category: "People",
    kpi: "1:1 Completion",
    frequency: "Weekly",
    done: true,
    completedAt: "Wed 15:20",
  },
  {
    id: "m8",
    teamId: "bu01",
    desc: "Log recognition for peer contributions",
    category: "People",
    kpi: "Recognition Count",
    frequency: "Weekly",
    done: false,
  },

  // --- BU02 · EMEA Wholesale ---
  {
    id: "m9",
    teamId: "bu02",
    desc: "Negotiate wholesale distributor terms",
    category: "Finance",
    kpi: "Margin Target",
    frequency: "Quarterly",
    done: false,
  },
  {
    id: "m10",
    teamId: "bu02",
    desc: "Localize product catalog for EU launch",
    category: "Process/Tech",
    kpi: "Localization Coverage",
    frequency: "Monthly",
    done: false,
  },
  {
    id: "m11",
    teamId: "bu02",
    desc: "Onboard new EMEA support reps",
    category: "People",
    kpi: "Onboarding Completion",
    frequency: "Monthly",
    done: true,
    completedAt: "Thu 13:40",
  },

  // --- Engineering ---
  {
    id: "m12",
    teamId: "engineering",
    desc: "Fix critical auth bug in staging",
    category: "Process/Tech",
    kpi: "Bug Resolution SLA",
    frequency: "Weekly",
    done: true,
    completedAt: "Mon 10:02",
  },
  {
    id: "m13",
    teamId: "engineering",
    desc: "Clear code review backlog",
    category: "Process/Tech",
    kpi: "Review Turnaround",
    frequency: "Weekly",
    done: false,
  },
  {
    id: "m14",
    teamId: "engineering",
    desc: "Update on-call rotation doc",
    category: "People",
    kpi: "Doc Freshness",
    frequency: "Monthly",
    done: false,
  },

  // --- HR & Admin ---
  {
    id: "m15",
    teamId: "hr-admin",
    desc: "Process Q4 payroll adjustments",
    category: "Finance",
    kpi: "Payroll Accuracy",
    frequency: "Monthly",
    done: false,
  },
  {
    id: "m16",
    teamId: "hr-admin",
    desc: "Run quarterly engagement survey",
    category: "People",
    kpi: "Survey Response Rate",
    frequency: "Quarterly",
    done: false,
  },

  // --- Sales & Marketing ---
  {
    id: "m17",
    teamId: "sales-marketing",
    desc: "Finalize Q4 campaign budget",
    category: "Finance",
    kpi: "Budget Variance",
    frequency: "Quarterly",
    done: false,
  },
  {
    id: "m18",
    teamId: "sales-marketing",
    desc: "Review lead conversion funnel",
    category: "Customer",
    kpi: "Conversion Rate",
    frequency: "Weekly",
    done: true,
    completedAt: "Tue 14:00",
  },
  {
    id: "m19",
    teamId: "sales-marketing",
    desc: "Refresh brand messaging deck",
    category: "Process/Tech",
    kpi: "Deck Completion",
    frequency: "Monthly",
    done: false,
  },
];
