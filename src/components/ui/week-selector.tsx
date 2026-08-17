"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

function getMonday(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay();
  const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), diff));
}

function formatRange(weekStart: Date) {
  const end = new Date(weekStart.getTime());
  end.setUTCDate(end.getUTCDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${fmt(weekStart)} – ${fmt(end)}`;
}

export function WeekSelector({
  weekStart,
  onChange,
}: {
  weekStart: Date;
  onChange: (newWeekStart: Date) => void;
}) {
  const currentWeekStart = getMonday(new Date());
  const isCurrentWeek = weekStart.getTime() === currentWeekStart.getTime();

  const goToPrevWeek = () => {
    const prev = new Date(weekStart.getTime());
    prev.setUTCDate(prev.getUTCDate() - 7);
    onChange(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(weekStart.getTime());
    next.setUTCDate(next.getUTCDate() + 7);
    onChange(next);
  };

  return (
    <div className="flex items-center gap-3">
      {!isCurrentWeek && (
        <span className="rounded-md bg-[#FEF3C7] px-2.5 py-1 text-xs font-semibold text-[#B45309]">
          Viewing past week — Read Only
        </span>
      )}
      <div className="flex items-center gap-1 rounded-lg border border-[#E5E9F0] bg-white px-2 py-1.5">
        <button onClick={goToPrevWeek} aria-label="Previous week" className="p-1 text-[#5B6472] hover:text-[#16233F]">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[130px] text-center text-sm font-medium text-[#16233F]">
          {isCurrentWeek ? "Current Week" : formatRange(weekStart)}
        </span>
        <button
          onClick={goToNextWeek}
          disabled={isCurrentWeek}
          aria-label="Next week"
          className="p-1 text-[#5B6472] hover:text-[#16233F] disabled:opacity-30 disabled:hover:text-[#5B6472]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      {!isCurrentWeek && (
        <button
          onClick={() => onChange(currentWeekStart)}
          className="text-sm font-medium text-[#16233F] underline"
        >
          Back to Current
        </button>
      )}
    </div>
  );
}
