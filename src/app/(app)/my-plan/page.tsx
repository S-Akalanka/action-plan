"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeekSelector } from "@/components/ui/week-selector";
import { SummaryStrip } from "@/components/my-plan/summary-strip";
import { TaskGroup } from "@/components/my-plan/task-group";
import { AddAdHocTaskForm } from "@/components/my-plan/add-task-form";
import { CATEGORIES } from "@/lib/categories";
import type { CategoryKey, MyPlanTask } from "@/lib/types";
import { useTeam } from "@/lib/team-context";

const CATEGORY_MAP: Record<string, CategoryKey> = {
  FINANCE: "Finance",
  CUSTOMER: "Customer",
  PROCESS_TECH: "Process/Tech",
  PEOPLE: "People",
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

export default function MyPlanPage() {
  const [tasks, setTasks] = useState<MyPlanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(() => getMonday(new Date()));
  const { myTeams, loadingTeams, selectedTeamId } = useTeam();

  const isCurrentWeek = selectedWeek.getTime() === getMonday(new Date()).getTime();
  const selectedTeam = myTeams.find((t) => t.id === selectedTeamId) ?? null;

  useEffect(() => {
    if (loadingTeams) return;

    if (myTeams.length === 0) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const weekParam = toDateParam(selectedWeek);

    const mapMerged = async (tasksData: any[], instancesData: any[]) => {
      return Promise.all(
        tasksData.map(async (task: any) => {
          const instance = instancesData.find((i: any) => i.taskId === task.id);
          let comments: any[] = [];
          if (instance?.id) {
            comments = await fetch(`/api/instances/${instance.id}/comments`).then((r) => r.json());
          }
          return {
            id: task.id,
            instanceId: instance?.id,
            teamId: task.teamId,
            desc: task.description,
            details: task.details ?? "",
            deadline: task.deadline,
            category: CATEGORY_MAP[task.category] ?? task.category,
            kpi: task.kpiReference ?? "",
            frequency: task.frequency,
            done: instance?.status === "COMPLETE",
            active: instance?.isActivated ?? false,
            completedAt: instance?.completedAt ?? undefined,
            comments,
          };
        })
      );
    };

    if (selectedTeamId) {
      Promise.all([
        fetch(`/api/teams/${selectedTeamId}/tasks`).then((res) => res.json()),
        fetch(`/api/teams/${selectedTeamId}/instances?week=${weekParam}`).then((res) => res.json()),
      ])
        .then(async ([tasksData, instancesData]) => {
          const merged = await mapMerged(tasksData, instancesData); // ← await added
          setTasks(merged);
        })
        .catch((err) => console.error("Error loading tasks", err))
        .finally(() => setLoading(false));
    } else {
      const fetchPromises = myTeams.map((team) =>
        Promise.all([
          fetch(`/api/teams/${team.id}/tasks`).then((res) => res.json()),
          fetch(`/api/teams/${team.id}/instances?week=${weekParam}`).then((res) => res.json()),
        ]).then(async ([tasksData, instancesData]) => {
          if (!Array.isArray(tasksData) || !Array.isArray(instancesData)) return [];
          return await mapMerged(tasksData, instancesData); // ← await added
        })
      );

      Promise.all(fetchPromises)
        .then((results) => setTasks(results.flat()))
        .catch((err) => console.error("Error loading all tasks", err))
        .finally(() => setLoading(false));
    }
  }, [selectedTeamId, myTeams, loadingTeams, selectedWeek]);

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
    if (!task) return;
    const nextDone = !task.done;

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: nextDone } : t)));

    fetch(`/api/instances/${(task as any).instanceId}`, {
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
    if (!isCurrentWeek) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nextActive = !task.active;

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, active: nextActive } : t)));

    fetch(`/api/instances/${(task as any).instanceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActivated: nextActive }),
    });
  };

  // Renamed from saveComment — matches TaskGroup/task-row's single onAddComment prop.
  const addComment = (id: string, commentBody: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    fetch(`/api/instances/${(task as any).instanceId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: commentBody }),
    })
      .then((res) => res.json())
      .then((newComment) => {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, comments: [newComment, ...((t as any).comments ?? [])] }
              : t
          )
        );
      })
      .catch((err) => console.error("Failed to save comment", err));
  };

  const deleteTask = (id: string) => {
    if (!isCurrentWeek) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    fetch(`/api/tasks/${id}`, { method: "DELETE" });
  };

  const addTask = (data: { desc: string; details: string; category: CategoryKey; kpi: string }) => {
    if (!selectedTeamId) return;

    fetch(`/api/teams/${selectedTeamId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: data.category,
        description: data.desc,
        details: data.details || null,
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
            instanceId: created.firstInstanceId,
            teamId: selectedTeamId,
            desc: data.desc,
            details: data.details,
            deadline: created.deadline,
            category: data.category,
            kpi: data.kpi,
            frequency: "Ad-hoc",
            done: false,
            active: false,
            comments: [],
          } as any,
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
            onAddComment={addComment}
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
