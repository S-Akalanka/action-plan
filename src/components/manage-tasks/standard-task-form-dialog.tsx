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
import { CATEGORIES } from "@/lib/mock-data";
import type { CategoryKey, StandardTask, StandardTaskFrequency } from "@/lib/types";

const FREQUENCIES: StandardTaskFrequency[] = ["Weekly", "Bi-weekly", "Monthly", "Quarterly"];

const EMPTY_FORM = {
  description: "",
  details: "",
  category: CATEGORIES[0].key as CategoryKey,
  kpi: "",
  frequency: "Weekly" as StandardTaskFrequency,
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
  const isEditing = Boolean(initialTask);

  useEffect(() => {
    if (open) {
      setForm(
        initialTask
          ? {
              description: initialTask.description,
              details: initialTask.details,
              category: initialTask.category,
              kpi: initialTask.kpi,
              frequency: initialTask.frequency,
            }
          : EMPTY_FORM
      );
    }
  }, [open, initialTask]);

  const handleSave = () => {
    if (!form.description.trim()) return;
    onSave(
      {
        description: form.description.trim(),
        details: form.details.trim(),
        category: form.category,
        kpi: form.kpi.trim() || "—",
        frequency: form.frequency,
      },
      initialTask?.id
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Standard Task" : "Add Standard Task"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wider text-[#9AA3B2]">
              Description
            </Label>
            <Input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Monthly Financial Reconciliation"
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wider text-[#9AA3B2]">
              Details
            </Label>
            <Input
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
              value={form.kpi}
              onChange={(e) => setForm((f) => ({ ...f, kpi: e.target.value }))}
              placeholder="e.g. Ledger Accuracy %"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#16233F] hover:bg-[#0F1A30] text-white">
            {isEditing ? "Save Changes" : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
