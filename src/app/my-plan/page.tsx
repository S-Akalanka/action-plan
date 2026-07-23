"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SummaryStrip } from "@/components/my-plan/summary-strip";
import { TaskGroup } from "@/components/my-plan/task-group";
import { AddAdHocTaskForm } from "@/components/my-plan/add-task-form";
import { CATEGORIES, TEAMS } from "@/lib/mock-data";
import type { CategoryKey, MyPlanTask } from "@/lib/types";
import { useTeam } from "@/lib/team-context";

export default function MyPlanPage() {
  const [tasks, setTasks] = useState<MyPlanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { selectedTeamId } = useTeam();

  const selectedTeam = selectedTeamId
    ? TEAMS.find((t) => t.id === selectedTeamId) ?? null
    : null;

useEffect(() => {
  const teamId = selectedTeamId ?? TEAMS[0].id;
  console.log("Fetching for teamId:", teamId); // ADD THIS

  Promise.all([
    fetch(`/api/teams/${teamId}/tasks`).then((res) => res.json()),
    fetch(`/api/teams/${teamId}/instances`).then((res) => res.json()),
  ])
    .then(([tasksData, instancesData]) => {
      console.log("tasksData:", tasksData); // ADD THIS
      console.log("instancesData:", instancesData); // ADD THIS
        const merged: MyPlanTask[] = tasksData.map((task: any) => {
          const instance = instancesData.find((i: any) => i.taskId === task.id);
          return {
            id: task.id,
            teamId: task.teamId,
            desc: task.description,
            category: task.category,
            kpi: task.kpiReference ?? "",
            frequency: task.frequency,
            done: instance?.status === "COMPLETE",
            active: instance?.isActivated ?? false,
            completedAt: instance?.completedAt ?? undefined,
          };
        });
        setTasks(merged);
      })
      .finally(() => setLoading(false));
  }, [selectedTeamId]);

  const teamTasks = useMemo(
    () =>
      selectedTeamId
        ? tasks.filter((t) => t.teamId === selectedTeamId)
        : tasks,
    [tasks, selectedTeamId]
  );

  const overallPercent = useMemo(() => {
    if (teamTasks.length === 0) return 0;
    return Math.round((teamTasks.filter((t) => t.done).length / teamTasks.length) * 100);
  }, [teamTasks]);

  const categoryStats = useMemo(
    () =>
      CATEGORIES.map((cat) => {
        const catTasks = teamTasks.filter((t) => t.category === cat.key);
        return {
          key: cat.key,
          icon: cat.icon,
          done: catTasks.filter((t) => t.done).length,
          total: catTasks.length,
        };
      }),
    [teamTasks]
  );

  // Toggle now calls the real PATCH endpoint. UI updates optimistically,
  // then reconciles with whatever the server actually saved.
  const toggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nextDone = !task.done;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: nextDone } : t))
    );

    fetch(`/api/instances/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextDone ? "COMPLETE" : "INCOMPLETE" }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, done: updated.status === "COMPLETE", completedAt: updated.completedAt }
              : t
          )
        );
      });
  };

  const toggleActive = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nextActive = !task.active;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: nextActive } : t))
    );

    fetch(`/api/instances/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActivated: nextActive }),
    });
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    fetch(`/api/tasks/${id}`, { method: "DELETE" });
  };

  const addTask = (data: { desc: string; category: CategoryKey; kpi: string }) => {
    const teamId = selectedTeamId ?? TEAMS[0].id;

    fetch(`/api/teams/${teamId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: data.category,
        description: data.desc,
        kpiReference: data.kpi || null,
        frequency: "WEEKLY",
        source: "ADHOC",
      }),
    })
      .then((res) => res.json())
      .then((created) => {
        setTasks((prev) => [
          ...prev,
          {
            id: created.taskId,
            teamId,
            desc: data.desc,
            category: data.category,
            kpi: data.kpi,
            frequency: "Ad-hoc",
            done: false,
            active: false,
          },
        ]);
      });

    setAdding(false);
  };

  if (loading) {
    return (
      <main className="flex-1 px-8 py-8">
        <p className="text-sm text-[#5B6472]">Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex-1 px-8 py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Action Plan</h1>
          <p className="mt-1 text-sm text-[#5B6472]">
            Week 42 · {selectedTeam ? selectedTeam.label : "All Business Units"}
          </p>
        </div>
        <Button
          onClick={() => setAdding((v) => !v)}
          className="gap-1.5 rounded-lg bg-[#16233F] px-4 hover:bg-[#0F1A30] text-white"
        >
          <Plus className="h-4 w-4" />
          Add task
        </Button>
      </div>

      <div className="mb-8">
        <SummaryStrip overallPercent={overallPercent} categoryStats={categoryStats} />
      </div>

      {adding && (
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
            tasks={teamTasks.filter((t) => t.category === cat.key)}
            onToggle={toggle}
            onToggleActive={toggleActive}
            onDelete={deleteTask}
          />
        ))}
      </div>

      {teamTasks.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#E5E9F0] bg-white px-5 py-10 text-center text-sm text-[#9AA3B2]">
          No tasks tracked{selectedTeam ? ` for ${selectedTeam.label}` : ""} yet.
        </div>
      )}
    </main>
  );
}
