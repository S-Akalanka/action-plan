import { useState } from "react";
import { Pencil, Trash2, MessageSquare, Check, X } from "lucide-react";
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
  onEditComment,
  editingCommentId,
  onSaveComment,
  onCancelComment,
}: {
  task: MyPlanTask;
  readOnly?: boolean;
  onToggle: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onEditComment: (id: string) => void;
  editingCommentId: string | null;
  onSaveComment: (id: string, comment: string) => void;
  onCancelComment: () => void;
}) {
  const comment = (task as any).comment as string | null;
  const details = (task as any).details as string | undefined;
  const isEditingComment = editingCommentId === task.id;
  const [draft, setDraft] = useState(comment ?? "");

  // Comment only makes sense on an incomplete task, and per the design,
  // only actually needs to be visible/editable once looking at a past
  // week (readOnly) — the point is explaining why something WASN'T done.
  const canComment = !task.done && readOnly;

  const startEditing = () => {
    setDraft(comment ?? "");
    onEditComment(task.id);
  };

  const handleSave = () => {
    onSaveComment(task.id, draft.trim());
  };

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
          {canComment && (
            <button
              className={cn(
                "text-[#9AA3B2] hover:text-[#16233F]",
                comment && "text-[#B45309]"
              )}
              aria-label="Add or edit comment"
              onClick={startEditing}
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          )}
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
            disabled={readOnly}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isEditingComment ? (
        <div className="ml-9 flex items-center gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") onCancelComment();
            }}
            placeholder="Why wasn't this completed?"
            className="flex-1 rounded-lg border border-[#E5E9F0] px-3 py-1.5 text-sm outline-none focus:border-[#16233F] focus:ring-2 focus:ring-[#DCEBFC]"
          />
          <button
            onClick={handleSave}
            className="rounded-md bg-[#16233F] p-1.5 text-white hover:bg-[#0F1A30]"
            aria-label="Save comment"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onCancelComment}
            className="rounded-md border border-[#E5E9F0] p-1.5 text-[#5B6472] hover:bg-[#F5F6F8]"
            aria-label="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        comment && (
          <button
            onClick={canComment ? startEditing : undefined}
            className={cn(
              "ml-9 flex items-start gap-1.5 text-left text-xs text-[#B8BFCB]",
              canComment && "hover:text-[#9AA3B2]"
            )}
          >
            <MessageSquare className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="italic">{comment}</span>
          </button>
        )
      )}
    </li>
  );
}
