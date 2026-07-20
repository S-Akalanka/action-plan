import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  totalEntries,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalEntries: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const start = totalEntries === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalEntries);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E5E9F0] px-6 py-4">
      <span className="text-sm text-[#5B6472]">
        Showing {start} to {end} of {totalEntries} entries
      </span>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E9F0] text-[#5B6472] hover:bg-[#F5F6F8] disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium",
              p === page
                ? "bg-[#16233F] text-white"
                : "border border-[#E5E9F0] text-[#5B6472] hover:bg-[#F5F6F8]"
            )}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E9F0] text-[#5B6472] hover:bg-[#F5F6F8] disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
