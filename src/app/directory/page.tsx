"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { TeamSidebar } from "@/components/team-sidebar";
import { StandardTasksTable } from "@/components/directory/standard-tasks-table";
import { StandardTaskFormDialog } from "@/components/directory/standard-task-form-dialog";
import { Pagination } from "@/components/directory/pagination";
import { STANDARD_TASKS } from "@/lib/mock-data";
import type { StandardTask } from "@/lib/types";

const PAGE_SIZE = 5;

export default function DirectoryPage() {
  const [tasks, setTasks] = useState<StandardTask[]>(STANDARD_TASKS);
  const [page, setPage] = useState(1);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StandardTask | null>(null);

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
  };

  const saveTask = (data: Omit<StandardTask, "id">, id?: string) => {
    if (id) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    } else {
      setTasks((prev) => [...prev, { id: `st${Date.now()}`, ...data }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#16233F]">
      <SiteHeader />

      <div className="mx-auto flex max-w-[1400px]">
        <TeamSidebar selectedTeamId={selectedTeamId} onSelect={setSelectedTeamId} />

        <main className="flex-1 px-8 py-8">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Manage Standard Tasks</h1>
              <p className="mt-1 text-sm text-[#5B6472]">
                Administer global tasks applied across business units.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#FEF3C7] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#92400E]">
                Role: Admin
              </span>
              <Button
                onClick={openAddDialog}
                className="gap-1.5 rounded-lg bg-[#16233F] px-4 hover:bg-[#0F1A30]"
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
        </main>
      </div>

      <StandardTaskFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialTask={editingTask}
        onSave={saveTask}
      />
    </div>
  );
}
