import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export type TrendDirection = "up" | "down" | "neutral";

export interface SummaryCardData {
  id: string;
  label: string;
  icon: LucideIcon;
  percent: number;
  delta: string;
  trend: TrendDirection;
}

export interface UnitMetric {
  label: string;
  percent: number;
  /** Leave undefined for a healthy metric. */
  severity?: "critical" | "low";
}

export interface UnitData {
  id: string;
  /** Shown when the unit is identified by a BU code, e.g. "BU01". */
  code?: string;
  /** Shown instead of `code` when the unit has a proper name, e.g. "Engineering". */
  name?: string;
  overall: number;
  metrics: UnitMetric[];
}

export interface TrendPoint {
  label: string;
  percent: number;
}

export interface TopTeam {
  id: string;
  initials: string;
  name: string;
  percent: number;
}

// ---------------------------------------------------------------------------
// Action Plans
// ---------------------------------------------------------------------------

export type Frequency = "Weekly" | "Monthly" | "Quarterly";
export type CategoryKey = "Finance" | "Customer" | "Process/Tech" | "People";

export interface Task {
  id: string;
  title: string;
  kpi: string;
  frequency: Frequency;
  category: CategoryKey;
  completed: boolean;
  active: boolean;
}

export interface CategoryMeta {
  key: CategoryKey;
  icon: LucideIcon;
  percent: number;
}

// ---------------------------------------------------------------------------
// Task Ledger
// ---------------------------------------------------------------------------

export interface LedgerTask {
  id: string;
  title: string;
  category: CategoryKey;
  /** e.g. "Starts Oct 10" or "Completed Oct 02" */
  statusNote: string;
  kpi: string;
  frequency: Frequency;
  completed: boolean;
  active: boolean;
  ownerInitials: string;
  ownerTeam: string;
  ownerColor?: string;
  priority?: "High";
}

// ---------------------------------------------------------------------------
// My Action Plan (personal weekly view)
// ---------------------------------------------------------------------------

export type MyPlanFrequency = "Weekly" | "Monthly" | "Quarterly" | "Ad-hoc";

export interface Team {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface MyPlanTask {
  id: string;
  teamId: string;
  desc: string;
  category: CategoryKey;
  kpi: string;
  frequency: MyPlanFrequency;
  done: boolean;
  /** Controlled by the switch. false = Pending, true = In Progress/Completed depending on `done`. */
  active: boolean;
  /** Timestamp shown once a task is marked done, e.g. "Mon 09:14" */
  completedAt?: string;
}

export type MyPlanStatus = "Pending" | "In Progress" | "Completed";

export function getMyPlanStatus(active: boolean, done: boolean): MyPlanStatus {
  if (!active) return "Pending";
  return done ? "Completed" : "In Progress";
}

// ---------------------------------------------------------------------------
// Executive Summary (CEO read-only view)
// ---------------------------------------------------------------------------

export type TeamStatus = "On Track" | "Needs Attention" | "Pending";

export interface TeamCategoryMetric {
  category: CategoryKey;
  percent: number;
  severity?: "critical" | "low";
}

export interface ExecutiveTeamSummary {
  teamId: string;
  overall: number;
  status: TeamStatus;
  metrics: TeamCategoryMetric[];
}

export type InitiativeStatus = "Complete" | "In Progress" | "Pending";

export interface DrillDownInitiative {
  id: string;
  title: string;
  /** e.g. "Tech / Process" */
  subtitle: string;
  ownerInitials: string;
  ownerName: string;
  frequency: Frequency;
  kpi: string;
  status: InitiativeStatus;
}

export interface TeamDrilldownStats {
  teamId: string;
  totalTasks: number;
  completed: number;
  completedTrendLabel: string;
  inProgress: number;
  atRisk: number;
  performanceIndex: number;
  performanceTarget: number;
  teamSize: number;
  initiatives: DrillDownInitiative[];
}

// ---------------------------------------------------------------------------
// Directory: standard task templates (org-wide, applied across all BUs)
// ---------------------------------------------------------------------------

export type StandardTaskFrequency = "Weekly" | "Bi-weekly" | "Monthly" | "Quarterly";

export interface StandardTask {
  id: string;
  description: string;
  details: string;
  category: CategoryKey;
  kpi: string;
  frequency: StandardTaskFrequency;
  teamId?: string; // Optional team filter
}
