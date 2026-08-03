"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardTasksTable } from "@/components/manage-tasks/standard-tasks-table";
import { StandardTaskFormDialog } from "@/components/manage-tasks/standard-task-form-dialog";
import { Pagination } from "@/components/manage-tasks/pagination";
import type { StandardTask } from "@/lib/types";
import { useTeam } from "@/lib/team-context";

const PAGE_SIZE = 5;

export default function ManageTasksPage() {
  // Teams now come from useTeam()'s myTeams (real API), not a mock import.
  const { myTeams, loadingTeams, selectedTeamId, setSelectedTeamId } = useTeam();

  const [tasks, setTasks] = useState<StandardTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StandardTask | null>(null);

  const selectedTeam = selectedTeamId
    ? myTeams.find((t) => t.id === selectedTeamId)
    : null;

  useEffect(() => {
    if (loadingTeams || myTeams.length === 0) return;

    const teamId = selectedTeamId ?? myTeams[0].id;

    setLoading(true);
    fetch(`/api/admin/teams/${teamId}/tasks`)
      .then((res) => res.json())
      .then((data) => {
        const mapped: StandardTask[] = data.map((t: any) => ({
          id: t.taskId ?? t.id,
          description: t.description,
          details: t.details ?? "",
          category: t.category,
          kpi: t.kpiReference ?? "",
          frequency: t.frequency,
          teamId: t.teamId ?? teamId,
          isActive: t.isActive,
        }));
        setTasks(mapped);
      })
      .finally(() => setLoading(false));
  }, [selectedTeamId, myTeams, loadingTeams]);

  const totalPages = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE));
  const pageTasks = useMemo(
    () => tasks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [tasks, page]
  );

  const openAddDialog = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const openEditDialog = (task: StandardTask) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    fetch(`/api/tasks/${id}`, { method: "DELETE" });
  };

  const toggleActive = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nextActive = !task.isActive;

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: nextActive } : t)));

    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: nextActive }),
    });
  };

  const saveTask = (data: Omit<StandardTask, "id">, id?: string) => {
    if (id) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
      fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: data.description, kpiReference: data.kpi }),
      });
    } else {
      const teamId = selectedTeamId ?? myTeams[0]?.id;
      if (!teamId) return;

      fetch(`/api/teams/${teamId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: data.category,
          description: data.description,
          kpiReference: data.kpi,
          frequency: data.frequency,
          source: "STANDARD",
        }),
      })
        .then((res) => res.json())
        .then((created) => {
          setTasks((prev) => [...prev, { id: created.taskId, ...data, teamId, isActive: true }]);
        });
    }
  };

  if (loadingTeams || loading) {
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
          <h1 className="text-2xl font-bold">Manage Standard Tasks</h1>
          <p className="mt-1 text-sm text-[#5B6472]">
            Administer global tasks applied across business units · {selectedTeam ? selectedTeam.teamName : "All Business Units"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#FEF3C7] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#92400E]">
            Role: Admin
          </span>
          <Button
            onClick={openAddDialog}
            className="gap-1.5 rounded-lg bg-[#16233F] px-4 hover:bg-[#0F1A30] text-white"
          >
            <Plus className="h-4 w-4" />
            Add Standard Task
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E5E9F0] bg-white shadow-sm">
        <StandardTasksTable
          tasks={pageTasks}
          onEdit={openEditDialog}
          onDelete={deleteTask}
          onToggleActive={toggleActive}
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          totalEntries={tasks.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      <StandardTaskFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialTask={editingTask}
        onSave={saveTask}
      />
    </main>
  );
}
