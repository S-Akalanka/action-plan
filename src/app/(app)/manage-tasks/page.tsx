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
  const { myTeams, loadingTeams, selectedTeamId } = useTeam();

  const [tasks, setTasks] = useState<StandardTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StandardTask | null>(null);

  // selectedTeamId === null means "Overview" — matches the same convention
  // AppSidebar already uses (Overview button clears selectedTeamId).
  const selectedTeam = selectedTeamId
    ? myTeams.find((t) => t.id === selectedTeamId)
    : null;

  useEffect(() => {
    if (loadingTeams) return;

    const fetchTeamId = selectedTeamId ?? "all";

    setLoading(true);
    fetch(`/api/admin/teams/${fetchTeamId}/tasks`)
      .then((res) => res.json())
      .then((data) => {
        const mapped: StandardTask[] = data.map((t: any) => ({
          id: t.taskId ?? t.id,
          description: t.description,
          details: t.details ?? "",
          category: t.category,
          kpi: t.kpiReference ?? "",
          frequency: t.frequency,
          teamId: t.teamId,
          teamName: t.teamName,
        }));
        setTasks(mapped);
      })
      .finally(() => setLoading(false));
  }, [selectedTeamId, loadingTeams]);

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

  const saveTask = (data: Omit<StandardTask, "id">, id?: string) => {
    if (id) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
      fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: data.description, kpiReference: data.kpi }),
      });
    } else {
      // Adding a new task from Overview needs an explicit team — can't
      // create a task with no owning team. Require a specific team selected.
      if (!selectedTeamId) return;

      fetch(`/api/admin/teams/${selectedTeamId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: data.category,
          description: data.description,
          kpiReference: data.kpi,
          frequency: data.frequency,
        }),
      })
        .then((res) => res.json())
        .then((created) => {
          setTasks((prev) => [
            { id: created.taskId, ...data, teamId: selectedTeamId, teamName: created.teamName },
            ...prev,
          ]);
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
            disabled={!selectedTeamId}
            title={!selectedTeamId ? "Select a specific team to add a task" : undefined}
            className="gap-1.5 rounded-lg bg-[#16233F] px-4 hover:bg-[#0F1A30] text-white disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Standard Task
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E5E9F0] bg-white shadow-sm">
        <StandardTasksTable tasks={pageTasks} onEdit={openEditDialog} onDelete={deleteTask} />
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
