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

  useEffect(() => {
    if (open && task) {
      setForm({
        desc: task.desc,
        details: (task as any).details ?? "",
        kpi: task.kpi,
        comment: (task as any).comment ?? "",
      });
    }
  }, [open, task]);

  const handleSave = () => {
    if (!task || !form.desc.trim()) return;
    onSave(task.id, {
      desc: form.desc.trim(),
      details: form.details.trim(),
      kpi: form.kpi.trim(),
      comment: form.comment.trim(),
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

        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wider text-[#9AA3B2]">
              Description
            </Label>
            <Input
              value={form.desc}
              onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
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
