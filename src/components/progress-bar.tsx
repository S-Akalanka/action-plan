import { cn } from "@/lib/utils";

export function ProgressBar({
  percent,
  severity,
}: {
  percent: number;
  severity?: "critical" | "low";
}) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E9F0]">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          severity === "critical"
            ? "bg-[#DC2626]"
            : severity === "low"
              ? "bg-[#F97316]"
              : "bg-[#16233F]"
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
