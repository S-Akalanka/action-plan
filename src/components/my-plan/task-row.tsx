import { Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { MyPlanTask } from "@/lib/types";

export function MyPlanTaskRow({
  task,
  onToggle,
  onToggleActive,
  onDelete,
}: {
  task: MyPlanTask;
  onToggle: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex items-center gap-4 border-b border-[#E5E9F0] px-6 py-4 last:border-b-0 hover:bg-[#F9FAFB]">
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
              <span>Completed {task.completedAt}</span>
            </>
          )}
        </div>
      </div>

      {/* Single status badge — Complete > In Progress > Incomplete, never more than one shown */}
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
    </li>
  );
}
