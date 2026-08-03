"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquareWarning } from "lucide-react";

export interface PendingCommentTask {
  instanceId: string;
  taskDescription: string;
  teamName: string;
  weekStartDate: string; // e.g. "2026-06-29"
}

export function PendingCommentsBanner({
  tasks,
  onSubmitComment,
}: {
  tasks: PendingCommentTask[];
  onSubmitComment: (instanceId: string, comment: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  if (tasks.length === 0) return null;

  const handleSubmit = (instanceId: string) => {
    const comment = drafts[instanceId]?.trim();
    if (!comment) return;
    onSubmitComment(instanceId, comment);
    setDrafts((prev) => ({ ...prev, [instanceId]: "" }));
  };

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-[#F5D0A9] bg-[#FEF3C7]">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <div className="flex items-center gap-2.5">
          <MessageSquareWarning className="h-4 w-4 text-[#B45309]" />
          <span className="text-sm font-semibold text-[#92400E]">
            {tasks.length} task{tasks.length === 1 ? "" : "s"} from past weeks need a comment
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-[#B45309]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#B45309]" />
        )}
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
                  value={drafts[task.instanceId] ?? ""}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [task.instanceId]: e.target.value }))
                  }
                  placeholder="Why wasn't this completed?"
                  className="flex-1 rounded-lg border border-[#E5E9F0] px-3 py-2 text-sm outline-none focus:border-[#16233F]"
                />
                <button
                  onClick={() => handleSubmit(task.instanceId)}
                  disabled={!drafts[task.instanceId]?.trim()}
                  className="rounded-lg bg-[#16233F] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F1A30] disabled:opacity-40"
                >
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
