"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { PlanSidebar } from "@/components/my-plan/plan-sidebar";
import { SummaryStrip } from "@/components/my-plan/summary-strip";
import { TaskGroup } from "@/components/my-plan/task-group";
import { AddAdHocTaskForm } from "@/components/my-plan/add-task-form";
import { CATEGORIES, MY_PLAN_TASKS } from "@/lib/mock-data";
import type { CategoryKey, MyPlanTask } from "@/lib/types";

export default function MyPlanPage() {
  const [tasks, setTasks] = useState<MyPlanTask[]>(MY_PLAN_TASKS);
  const [adding, setAdding] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<CategoryKey | null>(null);

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

  const categoriesToShow = selectedTeam
    ? CATEGORIES.filter((c) => c.key === selectedTeam)
    : CATEGORIES;

  const toggle = (id: string) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              done: !t.done,
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

  const addTask = (data: { desc: string; category: CategoryKey; kpi: string }) => {
    setTasks((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        desc: data.desc,
        category: data.category,
        kpi: data.kpi,
        frequency: "Ad-hoc",
        done: false,
      },
    ]);
    setAdding(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#16233F]">
      <SiteHeader />

      <div className="mx-auto flex max-w-[1400px]">
        <PlanSidebar selected={selectedTeam} onSelect={setSelectedTeam} />

        <main className="flex-1 px-8 py-8">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">My Action Plan</h1>
              <p className="mt-1 text-sm text-[#5B6472]">
                Week 42 · {selectedTeam ?? "BU01 North America Retail"}
              </p>
            </div>
            <Button
              onClick={() => setAdding((v) => !v)}
              className="gap-1.5 rounded-lg bg-[#16233F] text-white px-4 hover:bg-[#0F1A30]"
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
            {categoriesToShow.map((cat) => (
              <TaskGroup
                key={cat.key}
                icon={cat.icon}
                label={cat.key}
                tasks={tasks.filter((t) => t.category === cat.key)}
                onToggle={toggle}
                onDelete={deleteTask}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
