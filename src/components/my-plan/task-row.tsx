import { useState } from "react";
import { Pencil, Trash2, Send } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { MyPlanTask } from "@/lib/types";

function formatCompletedAt(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MyPlanTaskRow({
  task,
  readOnly,
  onToggle,
  onToggleActive,
  onDelete,
  onEdit,
  onSubmitExcuse,
}: {
  task: MyPlanTask;
  readOnly?: boolean;
  onToggle: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSubmitExcuse: (instanceId: string, comment: string) => void;
}) {
  const details = (task as any).details as string | undefined;
  const source = (task as any).source as string | undefined;
  const isOverdue = (task as any).isOverdue as boolean;
  const instanceId = (task as any).instanceId as string;
  const isAdHoc = source === "ADHOC";

  const [excuseDraft, setExcuseDraft] = useState("");

  const handleDelete = () => {
    if (window.confirm(`Delete "${task.desc}"? This can't be undone.`)) {
      onDelete();
    }
  };

  const handleSubmitExcuse = () => {
    if (!excuseDraft.trim()) return;
    onSubmitExcuse(instanceId, excuseDraft.trim());
  };

  // Overdue row: excuse-only, no checkbox/switch/edit/delete. This is the
  // "repeated task shows twice" behavior — the current week's fresh
  // instance renders as its own separate normal row elsewhere in the list.
  if (isOverdue) {
    return (
      <li className="flex flex-col gap-2 border-b border-red-100 bg-red-50/50 px-6 py-4 last:border-b-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-900">{task.desc}</p>
            <p className="mt-0.5 text-xs text-red-600">Overdue — incomplete from a previous cycle</p>
          </div>
          <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">Overdue</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={excuseDraft}
            onChange={(e) => setExcuseDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmitExcuse();
            }}
            placeholder="Why wasn't this completed?"
            className="flex-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-red-400"
          />
          <button
            onClick={handleSubmitExcuse}
            disabled={!excuseDraft.trim()}
            className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            Submit
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-1.5 border-b border-[#E5E9F0] px-6 py-4 last:border-b-0 hover:bg-[#F9FAFB]">
      <div className="flex items-center gap-4">
        <Checkbox
          checked={task.done}
          onCheckedChange={onToggle}
          disabled={readOnly}
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
            {details && (
              <>
                <span>·</span>
                <span className="max-w-[240px] truncate" title={details}>
                  {details}
                </span>
              </>
            )}
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
            disabled={readOnly}
            aria-label="Toggle in progress"
          />
          {isAdHoc && (
            <button
              className="text-[#9AA3B2] hover:text-[#16233F]"
              aria-label="Edit task"
              onClick={onEdit}
              disabled={readOnly}
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <button
            className="text-[#9AA3B2] hover:text-red-600"
            aria-label="Delete task"
            onClick={handleDelete}
            disabled={readOnly}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}
