"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
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
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toDateParam(d: Date) {
  return d.toISOString().split("T")[0];
}

const mapMerged = (tasksData: any[], instancesData: any[]) =>
  tasksData.map((task: any) => {
    const instance = instancesData.find((i: any) => i.taskId === task.id);
    return {
      id: task.id,
      instanceId: instance?.id,
      teamId: task.teamId,
      desc: task.description,
      details: task.details ?? "",
      deadline: task.deadline,
      source: task.source,
      category: CATEGORY_MAP[task.category] ?? task.category,
      kpi: task.kpiReference ?? "",
      frequency: task.frequency,
      done: instance?.status === "COMPLETE",
      active: instance?.isActivated ?? false,
      completedAt: instance?.completedAt ?? undefined,
      comment: instance?.comment ?? null,
      needsExcuseForInstanceId: instance?.needsExcuseForInstanceId ?? null,
    };
  });

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
        const tasksData = await tasksRes.json();
        const instancesData = await instancesRes.json();
        return mapMerged(tasksData, instancesData);
      } else {
        const fetchPromises = myTeams.map(async (team) => {
          const [tasksRes, instancesRes] = await Promise.all([
            fetch(`/api/teams/${team.id}/tasks`),
            fetch(`/api/teams/${team.id}/instances?week=${weekParam}`),
          ]);
          const tasksData = await tasksRes.json();
          const instancesData = await instancesRes.json();
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
    queryClient.invalidateQueries({ queryKey: ["my-plan"] });
  };

  const toggleMutation = useMutation({
    mutationFn: async ({ instanceId, nextDone }: { instanceId: string; nextDone: boolean }) => {
      const res = await fetch(`/api/instances/${instanceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextDone ? "COMPLETE" : "INCOMPLETE" }),
      });
      return res.json();
    },
    onSuccess: invalidatePlan,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ instanceId, nextActive }: { instanceId: string; nextActive: boolean }) => {
      const res = await fetch(`/api/instances/${instanceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActivated: nextActive }),
      });
      return res.json();
    },
    onSuccess: invalidatePlan,
  });

  const submitExcuseMutation = useMutation({
    mutationFn: async ({ instanceId, comment }: { instanceId: string; comment: string }) => {
      const res = await fetch(`/api/instances/${instanceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
      return res.json();
    },
    onSuccess: invalidatePlan,
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    },
    onSuccess: invalidatePlan,
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
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: data.desc, details: data.details, kpiReference: data.kpi }),
      });

      if (instanceId) {
        await fetch(`/api/instances/${instanceId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment: data.comment }),
        });
      }
    },
    onSuccess: invalidatePlan,
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
      return res.json();
    },
    onSuccess: () => {
      invalidatePlan();
      setAdding(false);
    },
  });

  const overallPercent = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);
  }, [tasks]);

  const categoryStats = useMemo(
    () =>
      CATEGORIES.map((cat) => {
        const catTasks = tasks.filter((t) => t.category === cat.key);
        return {
          key: cat.key,
          icon: cat.icon,
          done: catTasks.filter((t) => t.done).length,
          total: catTasks.length,
        };
      }),
    [tasks]
  );

  const toggle = (id: string) => {
    if (!isCurrentWeek) return;
    const task = tasks.find((t) => t.id === id);
    if (!task || (task as any).needsExcuseForInstanceId) return;
    const instanceId = (task as any).instanceId;
    if (!instanceId) return;
    toggleMutation.mutate({ instanceId, nextDone: !task.done });
  };

  const toggleActive = (id: string) => {
    if (!isCurrentWeek) return;
    const task = tasks.find((t) => t.id === id);
    if (!task || (task as any).needsExcuseForInstanceId) return;
    const instanceId = (task as any).instanceId;
    if (!instanceId) return;
    toggleActiveMutation.mutate({ instanceId, nextActive: !task.active });
  };

  const submitExcuse = (needsExcuseForInstanceId: string, comment: string) => {
    submitExcuseMutation.mutate({ instanceId: needsExcuseForInstanceId, comment });
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
    saveEditMutation.mutate({ id, data, instanceId: (task as any)?.instanceId });
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
    </main>
  );
}

