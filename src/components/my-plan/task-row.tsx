import { Pencil, Trash2, MessageSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { MyPlanTask } from "@/lib/types";

// Formats an ISO timestamp into something short and readable,
// e.g. "Aug 3, 3:06 AM" instead of the raw ISO string.
function formatCompletedAt(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso; // fallback if it's not parseable
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MyPlanTaskRow({
  task,
  onToggle,
  onToggleActive,
  onDelete,
  onEdit,
}: {
  task: MyPlanTask;
  onToggle: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onEdit?: () => void;
}) {
  const comment = (task as any).comment as string | null | undefined;

  return (
    <li className="flex flex-col gap-1.5 border-b border-[#E5E9F0] px-6 py-4 last:border-b-0 hover:bg-[#F9FAFB]">
      <div className="flex items-center gap-4">
        <Checkbox
          checked={task.done}
          onCheckedChange={onToggle}
          className="h-5 w-5 shrink-0 border-[#C7CEDA] data-[state=checked]:border-[#16233F] data-[state=checked]:bg-[#16233F]"
        />

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-medium",
              task.done ? "text-[#9AA3B2] line-through" : "text-[#16233F]"
            )}
          >
            {task.desc}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#9AA3B2]">
            <span>KPI: {task.kpi}</span>
            <span>·</span>
            <span>{task.frequency}</span>
            {task.completedAt && (
              <>
                <span>·</span>
                <span>Completed {formatCompletedAt(task.completedAt)}</span>
              </>
            )}
          </div>
        </div>

        <div className="shrink-0">
          {task.done ? (
            <span className="rounded-md bg-[#DCFCE7] px-2 py-1 text-xs font-semibold text-[#16A34A]">Complete</span>
          ) : task.active ? (
            <span className="rounded-md bg-[#FEF3C7] px-2 py-1 text-xs font-semibold text-[#B45309]">In Progress</span>
          ) : (
            <span className="rounded-md bg-[#F1F2F5] px-2 py-1 text-xs font-semibold text-[#5B6472]">Incomplete</span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <Switch
            checked={task.active}
            onCheckedChange={onToggleActive}
            aria-label="Toggle in progress"
          />
          <button
            className="text-[#9AA3B2] hover:text-[#16233F]"
            aria-label="Edit task"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            className="text-[#9AA3B2] hover:text-red-600"
            aria-label="Delete task"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/*
        Muted comment preview — only shows if a comment exists. Faded/gray
        so it doesn't compete with the task description. Click Edit to
        change it; this is a read-only preview, not editable inline.
      */}
      {comment && (
        <div className="ml-9 flex items-start gap-1.5 text-xs text-[#B8BFCB]">
          <MessageSquare className="mt-0.5 h-3 w-3 shrink-0" />
          <span className="italic">{comment}</span>
        </div>
      )}
    </li>
  );
}
