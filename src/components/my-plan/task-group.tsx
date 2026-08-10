import type { LucideIcon } from "lucide-react";
import { MyPlanTaskRow } from "./task-row";
import type { MyPlanTask } from "@/lib/types";

export function TaskGroup({
  icon: Icon,
  label,
  tasks,
  readOnly,
  onToggle,
  onToggleActive,
  onDelete,
  onEditComment,
  editingCommentId,
  onSaveComment,
  onCancelComment,
}: {
  icon: LucideIcon;
  label: string;
  tasks: MyPlanTask[];
  readOnly?: boolean;
  onToggle: (id: string) => void;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  onEditComment: (id: string) => void;
  editingCommentId: string | null;
  onSaveComment: (id: string, comment: string) => void;
  onCancelComment: () => void;
}) {
  if (tasks.length === 0) return null;
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <section className="overflow-hidden rounded-xl border border-[#E5E9F0] bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-[#E5E9F0] bg-[#F9FAFB] px-6 py-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[#5B6472]" />
          <h2 className="text-base font-bold text-[#16233F]">{label}</h2>
        </div>
        <span className="text-xs font-medium text-[#5B6472]">
          {doneCount}/{tasks.length} complete
        </span>
      </header>
      <ul>
        {tasks.map((task) => (
          <MyPlanTaskRow
            key={task.id}
            task={task}
            readOnly={readOnly}
            onToggle={() => onToggle(task.id)}
            onToggleActive={() => onToggleActive(task.id)}
            onDelete={() => onDelete(task.id)}
            onEditComment={onEditComment}
            editingCommentId={editingCommentId}
            onSaveComment={onSaveComment}
            onCancelComment={onCancelComment}
          />
        ))}
      </ul>
    </section>
  );
}
