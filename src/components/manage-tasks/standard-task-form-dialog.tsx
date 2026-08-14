"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/categories";
import type { CategoryKey, StandardTask, StandardTaskFrequency } from "@/lib/types";
import { standardTaskFormSchema } from "@/lib/schemas";

const FEILD_CLASS = 
  "bg-gray-200/40 border-gray-400/40 focus:border-gray-400/40 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none placeholder:text-gray-500 "

const FREQUENCIES: StandardTaskFrequency[] = ["Once", "Weekly", "Bi-weekly", "Monthly", "Quarterly"];

const EMPTY_FORM = {
  description: "",
  details: "",
  category: CATEGORIES[0].key as CategoryKey,
  kpi: "",
  frequency: "Weekly" as StandardTaskFrequency,
  deadline: "",
};

export function StandardTaskFormDialog({
  open,
  onOpenChange,
  initialTask,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTask?: StandardTask | null;
  onSave: (data: Omit<StandardTask, "id">, id?: string) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(initialTask);

  useEffect(() => {
    if (open) {
      setError(null);
      setForm(
        initialTask
          ? {
              description: initialTask.description,
              details: initialTask.details,
              category: initialTask.category,
              kpi: initialTask.kpi,
              frequency: initialTask.frequency,
              deadline: (initialTask as any).deadline?.split("T")[0] ?? "",
            }
          : EMPTY_FORM
      );
    }
  }, [open, initialTask]);

  const handleSave = () => {
    const result = standardTaskFormSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid form input");
      return;
    }
    setError(null);
    onSave(
      {
        description: result.data.description,
        details: result.data.details ?? "",
        category: result.data.category,
        kpi: result.data.kpi || "—",
        frequency: result.data.frequency,
        deadline: result.data.deadline,
      } as any,
      initialTask?.id
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-none bg-gray-100/70 backdrop-blur-md border-gray-300/40 shadow-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Standard Task" : "Add Standard Task"}</DialogTitle>
        </DialogHeader>

        {error && <p className="text-xs font-medium text-red-600">{error}</p>}

        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wider text-[#9AA3B2]">
              Description
            </Label>
            <Input
              className={FEILD_CLASS}
              value={form.description}
              onChange={(e) => {
                setForm((f) => ({ ...f, description: e.target.value }));
                if (error) setError(null);
              }}
              placeholder="e.g. Monthly Financial Reconciliation"
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wider text-[#9AA3B2]">
              Details
            </Label>
            <Input
              className={FEILD_CLASS}
              value={form.details}
              onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
              placeholder="Short description of what this task involves"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wider text-[#9AA3B2]">
                Category
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v as CategoryKey }))}
              >
                <SelectTrigger className={FEILD_CLASS}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-200">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.key} value={cat.key}>
                      {cat.key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wider text-[#9AA3B2]">
                Frequency
              </Label>
              <Select
                value={form.frequency}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, frequency: v as StandardTaskFrequency }))
                }
              >
                <SelectTrigger className={FEILD_CLASS}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-200">
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wider text-[#9AA3B2]">
              KPI Reference
            </Label>
            <Input
              className={FEILD_CLASS}
              value={form.kpi}
              onChange={(e) => setForm((f) => ({ ...f, kpi: e.target.value }))}
              placeholder="e.g. Ledger Accuracy %"
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wider text-[#9AA3B2]">
              Deadline <span className="text-red-500">*</span>
            </Label>
            <Input
              className={FEILD_CLASS}
              type="date"
              value={form.deadline}
              onChange={(e) => {
                setForm((f) => ({ ...f, deadline: e.target.value }));
                if (error) setError(null);
              }}
            />
            <p className="mt-1 text-xs text-[#9AA3B2]">
              {form.frequency === "Once"
                ? "This task must be completed by this date."
                : "This task stops recurring after this date."}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!form.description.trim() || !form.deadline}
            className="bg-[#16233F] hover:bg-[#0F1A30] text-white disabled:opacity-50"
          >
            {isEditing ? "Save Changes" : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

