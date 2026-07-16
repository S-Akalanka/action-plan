"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SummaryStrip } from "@/components/my-plan/summary-strip";
import { TaskGroup } from "@/components/my-plan/task-group";
import { AddAdHocTaskForm } from "@/components/my-plan/add-task-form";
import { CATEGORIES, MY_PLAN_TASKS, TEAMS } from "@/lib/mock-data";
import type { CategoryKey, MyPlanTask } from "@/lib/types";
import { useTeam } from "@/lib/team-context";

export default function MyPlanPage() {
  const [tasks, setTasks] = useState<MyPlanTask[]>(MY_PLAN_TASKS);
  const [adding, setAdding] = useState(false);
  const { selectedTeamId } = useTeam();

  // null selectedTeamId = Overview → show all tasks across all teams
  const selectedTeam = selectedTeamId
    ? TEAMS.find((t) => t.id === selectedTeamId) ?? null
    : null;

  const teamTasks = useMemo(
    () =>
      selectedTeamId
        ? tasks.filter((t) => t.teamId === selectedTeamId)
        : tasks, // Overview: all tasks
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

  const toggle = (id: string) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              done: !t.done,
              active: !t.done ? true : t.active,
              completedAt: !t.done
                ? new Date().toLocaleDateString("en-US", { weekday: "short" }) +
                  " " +
                  new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : undefined,
            }
          : t
      )
    );

  const deleteTask = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const toggleActive = (id: string) =>
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextActive = !t.active;
          return {
            ...t,
            active: nextActive,
            done: nextActive ? t.done : false,
            completedAt: nextActive ? t.completedAt : undefined,
          };
        }
        return t;
      })
    );

  const addTask = (data: { desc: string; category: CategoryKey; kpi: string }) => {
    setTasks((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        teamId: selectedTeamId ?? TEAMS[0].id,
        desc: data.desc,
        category: data.category,
        kpi: data.kpi,
        frequency: "Ad-hoc",
        done: false,
        active: false,
      },
    ]);
    setAdding(false);
  };

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
          className="gap-1.5 rounded-lg bg-[#16233F] px-4 hover:bg-[#0F1A30]"
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
          <AddAdHocTaskForm
            onSave={addTask}
            onCancel={() => setAdding(false)}
          />
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
