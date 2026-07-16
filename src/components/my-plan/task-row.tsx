import { Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { getMyPlanStatus } from "@/lib/types";
import type { MyPlanTask } from "@/lib/types";

const STATUS_STYLES = {
  Pending: "bg-[#F1F2F5] text-[#5B6472]",
  "In Progress": "bg-[#FEF3C7] text-[#B45309]",
  Completed: "bg-[#DCFCE7] text-[#16A34A]",
} as const;

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
  const status = getMyPlanStatus(task.active, task.done);

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

      <span
        className={cn(
          "shrink-0 rounded-md px-2 py-1 text-xs font-semibold",
          STATUS_STYLES[status]
        )}
      >
        {status}
      </span>

      <div className="flex shrink-0 items-center gap-4">
        <Switch
          checked={task.active}
          onCheckedChange={onToggleActive}
          aria-label="Toggle active"
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
