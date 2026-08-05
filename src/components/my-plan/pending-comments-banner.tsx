"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquareWarning, Send } from "lucide-react";

export interface PendingCommentTask {
  instanceId: string;
  taskId: string;
  taskDescription: string;
  teamName: string;
  weekStartDate: string;
}

export function PendingCommentsBanner({
  tasks,
  onSubmitComment,
}: {
  tasks: PendingCommentTask[];
  onSubmitComment: (taskId: string, comment: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  if (tasks.length === 0) return null;

  const handleSubmit = (taskId: string) => {
    const comment = drafts[taskId]?.trim();
    if (!comment) return;
    onSubmitComment(taskId, comment);
    setDrafts((prev) => ({ ...prev, [taskId]: "" }));
  };

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-[#F5D0A9] bg-[#FEF3C7]">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-[#FDE9C4]"
      >
        <div className="flex items-center gap-2.5">
          <MessageSquareWarning className="h-4 w-4 text-[#B45309]" />
          <span className="text-sm font-semibold text-[#92400E]">
            {tasks.length} task{tasks.length === 1 ? "" : "s"} from past weeks need a comment
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#B45309]">
          {expanded ? "Hide" : "Review now"}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-[#F5D0A9] bg-white px-5 py-4">
          {tasks.map((task) => (
            <div
              key={task.instanceId}
              className="rounded-lg border border-[#E5E9F0] p-3"
            >
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-[#16233F]">{task.taskDescription}</p>
                <span className="text-xs text-[#9AA3B2]">
                  {task.teamName} · Week of {task.weekStartDate}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  value={drafts[task.taskId] ?? ""}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [task.taskId]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit(task.taskId);
                  }}
                  placeholder="Why wasn't this completed? (click to type)"
                  className="flex-1 cursor-text rounded-lg border border-[#E5E9F0] px-3 py-2 text-sm outline-none transition-colors focus:border-[#16233F] focus:ring-2 focus:ring-[#DCEBFC]"
                />
                <button
                  onClick={() => handleSubmit(task.taskId)}
                  disabled={!drafts[task.taskId]?.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-[#16233F] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0F1A30] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
