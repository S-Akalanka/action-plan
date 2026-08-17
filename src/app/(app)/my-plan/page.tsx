"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { WeekSelector } from "@/components/ui/week-selector";
import { SummaryStrip } from "@/components/my-plan/summary-strip";
import { TaskGroup } from "@/components/my-plan/task-group";
import { AddAdHocTaskForm } from "@/components/my-plan/add-task-form";
import { EditAdHocTaskDialog } from "@/components/my-plan/edit-ad-hoc-task-dialog";
import { CATEGORIES } from "@/lib/categories";
import type { CategoryKey, MyPlanTask } from "@/lib/types";
import { useTeam } from "@/lib/team-context";

const CATEGORY_MAP: Record<string, CategoryKey> = {
  FINANCE: "Finance",
  CUSTOMER: "Customer",
  PROCESS_TECH: "Process/Tech",
  PEOPLE: "People",
};

const FREQUENCY_TO_ENUM: Record<string, string> = {
  Once: "ONCE",
  Weekly: "WEEKLY",
  "Bi-weekly": "BI_WEEKLY",
  Monthly: "MONTHLY",
  Quarterly: "QUARTERLY",
};

function getMonday(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay();
  const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), diff));
}

function toDateParam(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function parseOrThrow(res: Response) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }
  return data;
}

// instancesData may contain TWO items for the same taskId — the fresh
// current-week instance (isOverdue: false) and an unresolved previous-week
// instance (isOverdue: true) needing a comment. Both become separate rows,
// using instance.id as the row key (not task.id), since task.id is no
// longer unique across the merged list.
const mapMerged = (tasksData: any[], instancesData: any[]) => {
  const rows: any[] = [];

  for (const instance of instancesData) {
    const task = tasksData.find((t: any) => t.id === instance.taskId);
    if (!task) continue;

    rows.push({
      id: instance.id, // row key — instance id, not task id (can repeat now)
      taskId: task.id,
      instanceId: instance.id,
      teamId: task.teamId,
      desc: task.description,
      details: task.details ?? "",
      deadline: task.deadline,
      source: task.source,
      category: CATEGORY_MAP[task.category] ?? task.category,
      kpi: task.kpiReference ?? "",
      frequency: task.frequency,
      done: instance.status === "COMPLETE",
      active: instance.isActivated ?? false,
      completedAt: instance.completedAt ?? undefined,
      comment: instance.comment ?? null,
      isOverdue: instance.isOverdue ?? false,
    });
  }

  return rows;
};

export default function MyPlanPage() {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<MyPlanTask | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(() => getMonday(new Date()));
  const { myTeams, loadingTeams, selectedTeamId } = useTeam();

  const isCurrentWeek = selectedWeek.getTime() === getMonday(new Date()).getTime();
  const selectedTeam = myTeams.find((t) => t.id === selectedTeamId) ?? null;
  const weekParam = toDateParam(selectedWeek);

  const { data: tasks = [], isLoading: loadingTasks } = useQuery<MyPlanTask[]>({
    queryKey: ["my-plan", selectedTeamId, weekParam, myTeams.map((t) => t.id).join(",")],
    queryFn: async () => {
      if (myTeams.length === 0) return [];

      if (selectedTeamId) {
        const [tasksRes, instancesRes] = await Promise.all([
          fetch(`/api/teams/${selectedTeamId}/tasks`),
          fetch(`/api/teams/${selectedTeamId}/instances?week=${weekParam}`),
        ]);
        const tasksData = await parseOrThrow(tasksRes);
        const instancesData = await parseOrThrow(instancesRes);
        return mapMerged(tasksData, instancesData);
      } else {
        const fetchPromises = myTeams.map(async (team) => {
          const [tasksRes, instancesRes] = await Promise.all([
            fetch(`/api/teams/${team.id}/tasks`),
            fetch(`/api/teams/${team.id}/instances?week=${weekParam}`),
          ]);
          const tasksData = await parseOrThrow(tasksRes);
          const instancesData = await parseOrThrow(instancesRes);
          if (!Array.isArray(tasksData) || !Array.isArray(instancesData)) return [];
          return mapMerged(tasksData, instancesData);
        });

        const results = await Promise.all(fetchPromises);
        return results.flat();
      }
    },
    enabled: !loadingTeams,
  });

  const invalidatePlan = () => {
    queryClient.invalidateQueries({ queryKey: ["my-plan"], refetchType: "all" });
  };

  // Hard refetch, bypassing staleness/active checks entirely — used after
  // the comment mutation specifically, since that PATCH can create a new
  // row server-side (see submitExcuseMutation) and we need the UI to
  // reflect that immediately, not on whatever cache timing invalidateQueries
  // would otherwise apply.
  const forceRefetchPlan = () => {
    return queryClient.refetchQueries({ queryKey: ["my-plan"], type: "all" });
  };

  const toggleMutation = useMutation({
    mutationFn: async ({ instanceId, nextDone }: { instanceId: string; nextDone: boolean }) => {
      const res = await fetch(`/api/instances/${instanceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextDone ? "COMPLETE" : "INCOMPLETE" }),
      });
      return parseOrThrow(res);
    },
    onSuccess: invalidatePlan,
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update task status"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ instanceId, nextActive }: { instanceId: string; nextActive: boolean }) => {
      const res = await fetch(`/api/instances/${instanceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActivated: nextActive }),
      });
      return parseOrThrow(res);
    },
    onSuccess: invalidatePlan,
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update task progress"),
  });

  // Commenting on an overdue instance resolves it AND causes the backend to
  // spawn a fresh current-week instance for the same task (it still wasn't
  // done). invalidatePlan() refetches instances for the currently selected
  // week, so if the user is looking at the current week that new row shows
  // up automatically — this just adds a toast so it isn't a silent change.
  const submitExcuseMutation = useMutation({
    mutationFn: async ({ instanceId, comment }: { instanceId: string; comment: string }) => {
      const res = await fetch(`/api/instances/${instanceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
      return parseOrThrow(res);
    },
    onSuccess: async (_data, variables) => {
      const task = tasks.find((t) => (t as any).instanceId === variables.instanceId);
      const wasOverdue = (task as any)?.isOverdue;
      await forceRefetchPlan();
      if (wasOverdue) {
        toast.success("Noted — this task has been added back to the current week.");
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to submit excuse"),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      await parseOrThrow(res);
    },
    onSuccess: invalidatePlan,
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to delete task"),
  });

  const saveEditMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      instanceId,
    }: {
      id: string;
      data: { desc: string; details: string; kpi: string; comment: string };
      instanceId?: string;
    }) => {
      const taskRes = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: data.desc, details: data.details, kpiReference: data.kpi }),
      });
      await parseOrThrow(taskRes);

      if (instanceId) {
        const instanceRes = await fetch(`/api/instances/${instanceId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment: data.comment }),
        });
        await parseOrThrow(instanceRes);
      }
    },
    onSuccess: invalidatePlan,
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to save task"),
  });

  const addTaskMutation = useMutation({
    mutationFn: async (data: {
      desc: string;
      details: string;
      category: CategoryKey;
      kpi: string;
      frequency: string;
    }) => {
      if (!selectedTeamId) return;
      const res = await fetch(`/api/teams/${selectedTeamId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: data.category,
          description: data.desc,
          details: data.details || null,
          kpiReference: data.kpi || null,
          frequency: FREQUENCY_TO_ENUM[data.frequency] ?? "ONCE",
          source: "ADHOC",
        }),
      });
      return parseOrThrow(res);
    },
    onSuccess: () => {
      invalidatePlan();
      setAdding(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to add task"),
  });

  const overallPercent = useMemo(() => {
    const currentOnly = tasks.filter((t) => !(t as any).isOverdue);
    if (currentOnly.length === 0) return 0;
    return Math.round((currentOnly.filter((t) => t.done).length / currentOnly.length) * 100);
  }, [tasks]);

  const categoryStats = useMemo(
    () =>
      CATEGORIES.map((cat) => {
        const catTasks = tasks.filter((t) => t.category === cat.key && !(t as any).isOverdue);
        return {
          key: cat.key,
          icon: cat.icon,
          done: catTasks.filter((t) => t.done).length,
          total: catTasks.length,
        };
      }),
    [tasks]
  );

  // Overdue rows are excuse-only — no complete/active toggling on them.
  const toggle = (id: string) => {
    if (!isCurrentWeek) return;
    const task = tasks.find((t) => t.id === id);
    if (!task || (task as any).isOverdue) return;
    const instanceId = (task as any).instanceId;
    if (!instanceId) return;
    toggleMutation.mutate({ instanceId, nextDone: !task.done });
  };

  const toggleActive = (id: string) => {
    if (!isCurrentWeek) return;
    const task = tasks.find((t) => t.id === id);
    if (!task || (task as any).isOverdue) return;
    const instanceId = (task as any).instanceId;
    if (!instanceId) return;
    toggleActiveMutation.mutate({ instanceId, nextActive: !task.active });
  };

  const submitExcuse = (instanceId: string, comment: string) => {
    submitExcuseMutation.mutate({ instanceId, comment });
  };

  const deleteTask = (id: string) => {
    if (!isCurrentWeek) return;
    deleteTaskMutation.mutate(id);
  };

  const openEdit = (task: MyPlanTask) => {
    setEditingTask(task);
    setEditDialogOpen(true);
  };

  const saveEdit = (id: string, data: { desc: string; details: string; kpi: string; comment: string }) => {
    const task = tasks.find((t) => t.id === id);
    saveEditMutation.mutate({ id: (task as any)?.taskId ?? id, data, instanceId: (task as any)?.instanceId });
  };

  const addTask = (data: {
    desc: string;
    details: string;
    category: CategoryKey;
    kpi: string;
    frequency: string;
  }) => {
    addTaskMutation.mutate(data);
  };

  if (loadingTeams || loadingTasks) {
    return (
      <main className="flex-1 px-8 py-8">
        <p className="text-sm text-[#5B6472]">Loading…</p>
      </main>
    );
  }

  if (myTeams.length === 0) {
    return (
      <main className="flex-1 px-8 py-8">
        <p className="text-sm text-[#5B6472]">You are not a member of any team.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 px-8 py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Action Plan</h1>
          <p className="mt-1 text-sm text-[#5B6472]">
            {selectedTeam ? selectedTeam.teamName : "Overview"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <WeekSelector weekStart={selectedWeek} onChange={setSelectedWeek} />
          {selectedTeamId && isCurrentWeek && (
            <Button
              onClick={() => setAdding((v) => !v)}
              className="gap-1.5 rounded-lg bg-[#16233F] px-4 hover:bg-[#0F1A30] text-white"
            >
              <Plus className="h-4 w-4" />
              Add task
            </Button>
          )}
        </div>
      </div>

      {!isCurrentWeek && (
        <div className="mb-6 rounded-md bg-[#F1F2F5] px-4 py-2 text-xs font-medium text-[#5B6472]">
          Viewing a past week — read-only.
        </div>
      )}

      <div className="mb-8">
        <SummaryStrip overallPercent={overallPercent} categoryStats={categoryStats} />
      </div>

      {adding && isCurrentWeek && (
        <div className="mb-8">
          <AddAdHocTaskForm onSave={addTask} onCancel={() => setAdding(false)} />
        </div>
      )}

      <div className="space-y-6">
        {CATEGORIES.map((cat) => (
          <TaskGroup
            key={cat.key}
            icon={cat.icon}
            label={cat.key}
            tasks={tasks.filter((t) => t.category === cat.key)}
            readOnly={!isCurrentWeek}
            onToggle={toggle}
            onToggleActive={toggleActive}
            onDelete={deleteTask}
            onEdit={openEdit}
            onSubmitExcuse={submitExcuse}
          />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#E5E9F0] bg-white px-5 py-10 text-center text-sm text-[#9AA3B2]">
          No tasks tracked{selectedTeam ? ` for ${selectedTeam.teamName}` : " across your teams"} yet.
        </div>
      )}

      <EditAdHocTaskDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        task={editingTask}
        onSave={saveEdit}
      />

      <Toaster />
    </main>
  );
}
