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
import { Textarea } from "@/components/ui/textarea";
import type { MyPlanTask } from "@/lib/types";
import { editAdHocTaskFormSchema } from "@/lib/schemas";

export function EditAdHocTaskDialog({
  open,
  onOpenChange,
  task,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: MyPlanTask | null;
  onSave: (id: string, data: { desc: string; details: string; kpi: string; comment: string }) => void;
}) {
  const [form, setForm] = useState({ desc: "", details: "", kpi: "", comment: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && task) {
      setError(null);
      setForm({
        desc: task.desc,
        details: (task as any).details ?? "",
        kpi: task.kpi,
        comment: (task as any).comment ?? "",
      });
    }
  }, [open, task]);

  const handleSave = () => {
    if (!task) return;
    const result = editAdHocTaskFormSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid form input");
      return;
    }
    setError(null);
    onSave(task.id, {
      desc: result.data.desc,
      details: result.data.details ?? "",
      kpi: result.data.kpi ?? "",
      comment: result.data.comment ?? "",
    });
    onOpenChange(false);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        {error && <p className="text-xs font-medium text-red-600">{error}</p>}

        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wider text-[#9AA3B2]">
              Description
            </Label>
            <Input
              value={form.desc}
              onChange={(e) => {
                setForm((f) => ({ ...f, desc: e.target.value }));
                if (error) setError(null);
              }}
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wider text-[#9AA3B2]">
              Details
            </Label>
            <Input
              value={form.details}
              onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
              placeholder="Additional context about this task"
            />
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

          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wider text-[#9AA3B2]">
              Comment
            </Label>
            <Textarea
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="Optional note about this task"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!form.desc.trim()}
            className="bg-[#16233F] hover:bg-[#0F1A30] text-white disabled:opacity-50"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

