import { Pencil, Trash2 } from "lucide-react";
import type { StandardTask } from "@/lib/types";

export function StandardTasksTable({
  tasks,
  onEdit,
  onDelete,
}: {
  tasks: StandardTask[];
  onEdit: (task: StandardTask) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      <div className="hidden grid-cols-[1fr_140px_160px_140px_120px_90px] gap-4 border-b border-[#E5E9F0] bg-[#F9FAFB] px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#9AA3B2] md:grid">
        <span>Description</span>
        <span>Category</span>
        <span>KPI</span>
        <span>Frequency</span>
        <span>Assigned Team</span>
        <span className="text-right">Actions</span>
      </div>

      <div className="divide-y divide-[#E5E9F0]">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-[1fr_140px_160px_140px_120px_90px] md:items-center md:gap-4"
          >
            <div>
              <p className="text-sm font-semibold text-[#16233F]">{task.description}</p>
              <p className="text-xs text-[#9AA3B2]">{task.details}</p>
            </div>
            <span className="text-sm text-[#5B6472]">{task.category}</span>
            <span className="text-sm text-[#5B6472]">{task.kpi}</span>
            <span className="text-sm text-[#5B6472]">{task.frequency}</span>
            <span className="text-sm text-[#5B6472]">{(task as any).teamName ?? "—"}</span>
            <div className="flex items-center gap-3 md:justify-end">
              <button
                className="text-[#9AA3B2] hover:text-[#16233F]"
                aria-label="Edit standard task"
                onClick={() => onEdit(task)}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                className="text-[#9AA3B2] hover:text-red-600"
                aria-label="Delete standard task"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-[#9AA3B2]">
            No standard tasks yet.
          </div>
        )}
      </div>
    </>
  );
}
