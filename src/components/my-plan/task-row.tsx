import { useState } from "react";
import { Pencil, Trash2, MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { MyPlanTask } from "@/lib/types";

interface CommentEntry {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
}

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

function formatCommentDate(iso: string): string {
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
  onAddComment,
}: {
  task: MyPlanTask;
  readOnly?: boolean;
  onToggle: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onAddComment: (id: string, body: string) => void;
}) {
  const comments = ((task as any).comments ?? []) as CommentEntry[];
  const details = (task as any).details as string | undefined;
  const deadline = (task as any).deadline as string | undefined;

  const [showHistory, setShowHistory] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [draft, setDraft] = useState("");

  const isPastDeadline = deadline ? new Date(deadline) < new Date() : false;
  const canComment = !task.done && isPastDeadline;
  const latestComment = comments[0]; // API returns newest first

  const handleSubmit = () => {
    if (!draft.trim()) return;
    onAddComment(task.id, draft.trim());
    setDraft("");
    setShowAddInput(false);
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
                comments.length > 0 && "text-red-600"
              )}
              aria-label="Add comment"
              onClick={() => setShowAddInput((v) => !v)}
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          )}
          <button className="text-[#9AA3B2] hover:text-[#16233F]" aria-label="Edit task">
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

      {/* Latest comment preview + expand-for-history, shown by default whenever comments exist */}
      {comments.length > 0 && (
        <div className="ml-9">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="flex w-full items-start gap-1.5 text-left text-xs text-red-600 hover:text-red-700"
          >
            <MessageSquare className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="flex-1 italic">{latestComment.body}</span>
            <span className="flex shrink-0 items-center gap-1 text-[#9AA3B2]">
              {comments.length > 1 && `+${comments.length - 1} more`}
              {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </span>
          </button>

          {showHistory && (
            <div className="mt-2 space-y-2 rounded-lg border border-[#E5E9F0] bg-white p-3">
              {comments.map((c) => (
                <div key={c.id} className="text-xs">
                  <p className="text-[#16233F]">{c.body}</p>
                  <p className="mt-0.5 text-[#9AA3B2]">
                    {c.authorName} · {formatCommentDate(c.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add-comment input — always appends, never overwrites */}
      {showAddInput && (
        <div className="ml-9 flex items-center gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") setShowAddInput(false);
            }}
            placeholder="Why wasn't this completed?"
            className="flex-1 rounded-lg border border-[#E5E9F0] px-3 py-1.5 text-sm outline-none focus:border-[#16233F] focus:ring-2 focus:ring-[#DCEBFC]"
          />
          <button
            onClick={handleSubmit}
            disabled={!draft.trim()}
            className="flex items-center gap-1.5 rounded-md bg-[#16233F] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0F1A30] disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      )}
    </li>
  );
}
