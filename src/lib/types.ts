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

export interface MyPlanTask {
  id: string;
  desc: string;
  category: CategoryKey;
  kpi: string;
  frequency: MyPlanFrequency;
  done: boolean;
  /** Timestamp shown once a task is marked done, e.g. "Mon 09:14" */
  completedAt?: string;
}
