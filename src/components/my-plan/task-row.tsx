import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { MyPlanTask } from "@/lib/types";

export function MyPlanTaskRow({
  task,
  onToggle,
}: {
  task: MyPlanTask;
  onToggle: () => void;
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

      <span
        className={cn(
          "shrink-0 rounded-md px-2 py-1 text-xs font-medium",
          task.frequency === "Ad-hoc"
            ? "border border-[#FBBF24] bg-[#FEF3C7] text-[#92400E]"
            : "bg-[#F1F2F5] text-[#5B6472]"
        )}
      >
        {task.frequency}
      </span>
    </li>
  );
}
