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
}

export interface UnitMetric {
  label: string;
  percent: number;
  severity?: "critical" | "low";
}

export interface UnitData {
  id: string;
  code?: string;
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
// Tasks — canonical shape (single source of truth for mock/API data)
// ---------------------------------------------------------------------------

export type CategoryKey = "Finance" | "Customer" | "Process/Tech" | "People";
export type TaskFrequency = "Weekly" | "Bi-weekly" | "Monthly" | "Quarterly" | "Ad-hoc";
export type TaskSource = "standard" | "adhoc";
export type TaskScope = "plan" | "ledger" | "my-plan" | "standard" | "initiative";

export interface TaskOwner {
  initials: string;
  name?: string;
  team: string;
  color?: string;
}

/** Unified task record — aligns with Prisma Task + TaskInstance fields. */
export interface ActionTask {
  id: string;
  description: string;
  details?: string;
  category: CategoryKey;
  kpi: string;
  frequency: TaskFrequency;
  teamId?: string;
  source?: TaskSource;
  active: boolean;
  completed: boolean;
  completedAt?: string;
  statusNote?: string;
  priority?: "High";
  owner?: TaskOwner;
  /** Which UI views should include this task. */
  scope: TaskScope[];
}

export type Frequency = "Weekly" | "Monthly" | "Quarterly";
export type MyPlanFrequency = "Weekly" | "Monthly" | "Quarterly" | "Ad-hoc";
export type StandardTaskFrequency = "Once" | "Weekly" | "Bi-weekly" | "Monthly" | "Quarterly";

function toCoreFrequency(frequency: TaskFrequency): Frequency {
  if (frequency === "Bi-weekly" || frequency === "Ad-hoc") return "Weekly";
  return frequency;
}

export function toTask(task: ActionTask): Task {
  return {
    id: task.id,
    title: task.description,
    kpi: task.kpi,
    frequency: toCoreFrequency(task.frequency),
    category: task.category,
    completed: task.completed,
    active: task.active,
  };
}

export function toLedgerTask(task: ActionTask): LedgerTask {
  return {
    id: task.id,
    title: task.description,
    category: task.category,
    statusNote: task.statusNote ?? "",
    kpi: task.kpi,
    frequency: toCoreFrequency(task.frequency),
    completed: task.completed,
    active: task.active,
    ownerInitials: task.owner!.initials,
    ownerTeam: task.owner!.team,
    ownerColor: task.owner?.color,
    priority: task.priority,
  };
}

export function toMyPlanTask(task: ActionTask): MyPlanTask {
  return {
    id: task.id,
    teamId: task.teamId!,
    desc: task.description,
    category: task.category,
    kpi: task.kpi,
    frequency: task.frequency as MyPlanFrequency,
    done: task.completed,
    active: task.active,
    completedAt: task.completedAt,
  };
}

export function toStandardTask(task: ActionTask): StandardTask {
  return {
    id: task.id,
    description: task.description,
    details: task.details ?? "",
    category: task.category,
    kpi: task.kpi,
    frequency: task.frequency as StandardTaskFrequency,
    teamId: task.teamId,
    isActive: task.active,
  };``
}

export function toDrillDownInitiative(task: ActionTask): DrillDownInitiative {
  return {
    id: task.id,
    title: task.description,
    subtitle: task.owner!.team,
    ownerInitials: task.owner!.initials,
    ownerName: task.owner!.name ?? task.owner!.initials,
    frequency: toCoreFrequency(task.frequency),
    kpi: task.kpi,
    active: task.active,
    completed: task.completed,
  };
}

// ---------------------------------------------------------------------------
// Action Plans
// ---------------------------------------------------------------------------

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

export interface Team {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export interface MyPlanTask {
  id: string;
  teamId: string;
  details?: string;
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


export interface DrillDownInitiative {
  id: string;
  title: string;
  /** e.g. "Tech / Process" */
  subtitle: string;
  ownerInitials: string;
  ownerName: string;
  frequency: Frequency;
  kpi: string;
  active: boolean;
  completed: boolean;
}

export interface TeamDrilldownStats {
  teamId: string;
  totalTasks: number;
  completed: number;        // count where task.completed === true
  incomplete: number;       // count where task.completed === false
  currentlyActive: number;  // count where task.active === true (independent of completed)
  completedTrendLabel: string;
  performanceIndex: number; // keep if this is just completed/totalTasks restated — drop if not
  initiatives: DrillDownInitiative[];
}

// ---------------------------------------------------------------------------
// manage-tasks: standard task templates (org-wide, applied across all BUs)
// ---------------------------------------------------------------------------

export interface StandardTask {
  id: string;
  description: string;
  details: string;
  category: CategoryKey;
  kpi: string;
  frequency: StandardTaskFrequency;
  teamId?: string;
  isActive: boolean;
}

export interface MyPlanTask {
  id: string;
  teamId: string;
  desc: string;
  category: CategoryKey;
  kpi: string;
  frequency: MyPlanFrequency;
  done: boolean;
  /** Independent of `done`. True = someone has started working on this task. */
  active: boolean;
  /** Timestamp shown once a task is marked done, e.g. "Mon 09:14" */
  completedAt?: string;
}
