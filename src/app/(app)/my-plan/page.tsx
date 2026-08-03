"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SummaryStrip } from "@/components/my-plan/summary-strip";
import { TaskGroup } from "@/components/my-plan/task-group";
import { AddAdHocTaskForm } from "@/components/my-plan/add-task-form";
import { PendingCommentsBanner, type PendingCommentTask } from "@/components/my-plan/pending-comments-banner";
import { CATEGORIES } from "@/lib/categories";
import type { CategoryKey, MyPlanTask } from "@/lib/types";
import { useTeam } from "@/lib/team-context";

const CATEGORY_MAP: Record<string, CategoryKey> = {
  FINANCE: "Finance",
  CUSTOMER: "Customer",
  PROCESS_TECH: "Process/Tech",
  PEOPLE: "People",
};

const mock_tasks=[
  { instanceId: "test1", taskDescription: "Review Q3 spend", teamName: "BU01", weekStartDate: "2026-06-22" },
  { instanceId: "test2", taskDescription: "Deploy staging build", teamName: "Engineering", weekStartDate: "2026-06-15" },
]

export default function MyPlanPage() {
  const [tasks, setTasks] = useState<MyPlanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { myTeams, loadingTeams, selectedTeamId } = useTeam();

  const [pendingComments, setPendingComments] = useState<PendingCommentTask[]>([]);

  useEffect(() => {
    fetch("/api/me/pending-comments")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: PendingCommentTask[]) => setPendingComments(data))
      .catch(() => setPendingComments(mock_tasks));
  }, []);

  const handleSubmitComment = (instanceId: string, comment: string) => {
    setPendingComments((prev) => prev.filter((t) => t.instanceId !== instanceId));

    fetch(`/api/instances/${instanceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    }).catch(() => {
    });
  };
  // ──────────────────────────────────────────────────────────────────────

  const selectedTeam = selectedTeamId
    ? myTeams.find((t) => t.id === selectedTeamId) ?? null
    : null;

  useEffect(() => {
    if (loadingTeams) return;

    if (myTeams.length === 0) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (selectedTeamId) {
      Promise.all([
        fetch(`/api/teams/${selectedTeamId}/tasks`).then((res) => res.json()),
        fetch(`/api/teams/${selectedTeamId}/instances`).then((res) => res.json()),
      ])
        .then(([tasksData, instancesData]) => {
          const merged: MyPlanTask[] = tasksData.map((task: any) => {
            const instance = instancesData.find((i: any) => i.taskId === task.id);
            return {
              id: task.id,
              teamId: task.teamId,
              desc: task.description,
              category: CATEGORY_MAP[task.category] ?? task.category,
              kpi: task.kpiReference ?? "",
              frequency: task.frequency,
              done: instance?.status === "COMPLETE",
              active: instance?.isActivated ?? false,
              completedAt: instance?.completedAt ?? undefined,
            };
          });
          setTasks(merged);
        })
        .catch((err) => console.error("Error loading tasks", err))
        .finally(() => setLoading(false));
    } else {
      const fetchPromises = myTeams.map((team) =>
        Promise.all([
          fetch(`/api/teams/${team.id}/tasks`).then((res) => res.json()),
          fetch(`/api/teams/${team.id}/instances`).then((res) => res.json()),
        ]).then(([tasksData, instancesData]) => {
          if (!Array.isArray(tasksData) || !Array.isArray(instancesData)) return [];
          return tasksData.map((task: any) => {
            const instance = instancesData.find((i: any) => i.taskId === task.id);
            return {
              id: task.id,
              teamId: task.teamId,
              desc: task.description,
              category: CATEGORY_MAP[task.category] ?? task.category,
              kpi: task.kpiReference ?? "",
              frequency: task.frequency,
              done: instance?.status === "COMPLETE",
              active: instance?.isActivated ?? false,
              completedAt: instance?.completedAt ?? undefined,
            };
          });
        })
      );

      Promise.all(fetchPromises)
        .then((results) => setTasks(results.flat()))
        .catch((err) => console.error("Error loading all tasks", err))
        .finally(() => setLoading(false));
    }
  }, [selectedTeamId, myTeams, loadingTeams]);

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
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nextDone = !task.done;

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: nextDone } : t)));

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

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, active: nextActive } : t)));

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
    if (!selectedTeamId) return;

    fetch(`/api/teams/${selectedTeamId}/tasks`, {
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
            id: created.id,
            teamId: selectedTeamId,
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

  if (loadingTeams || loading) {
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
            Week 42 · {selectedTeam ? selectedTeam.teamName : "Overview"}
          </p>
        </div>
        {selectedTeamId && (
          <Button
            onClick={() => setAdding((v) => !v)}
            className="gap-1.5 rounded-lg bg-[#16233F] px-4 hover:bg-[#0F1A30] text-white"
          >
            <Plus className="h-4 w-4" />
            Add task
          </Button>
        )}
      </div>

      <PendingCommentsBanner tasks={pendingComments} onSubmitComment={handleSubmitComment} />

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
            tasks={tasks.filter((t) => t.category === cat.key)}
            onToggle={toggle}
            onToggleActive={toggleActive}
            onDelete={deleteTask}
          />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#E5E9F0] bg-white px-5 py-10 text-center text-sm text-[#9AA3B2]">
          No tasks tracked{selectedTeam ? ` for ${selectedTeam.teamName}` : " across your teams"} yet.
        </div>
      )}
    </main>
  );
}
