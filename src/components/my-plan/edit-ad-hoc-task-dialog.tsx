"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type { MyPlanTask } from "@/lib/types";
import {
  editAdHocTaskFormSchema,
  type EditAdHocTaskFormValues,
} from "@/lib/schemas";

const LABEL_CLASS =
  "mb-1.5 block text-xs uppercase tracking-wider text-[#9AA3B2] text-gray-500";
const FEILD_CLASS = 
  "bg-gray-200/40 border-gray-400/40 focus:border-gray-400/40 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none placeholder:text-gray-500 "

export function EditAdHocTaskDialog({
  open,
  onOpenChange,
  task,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: MyPlanTask | null;
  onSave: (
    id: string,
    data: { desc: string; details: string; kpi: string; comment: string },
  ) => void;
}) {
  const form = useForm<EditAdHocTaskFormValues>({
    resolver: zodResolver(editAdHocTaskFormSchema),
    defaultValues: { desc: "", details: "", kpi: "", comment: "" },
  });

  useEffect(() => {
    if (open && task) {
      form.reset({
        desc: task.desc,
        details: (task as any).details ?? "",
        kpi: task.kpi,
        comment: (task as any).comment ?? "",
      });
    }
  }, [open, task, form]);

  const handleSubmit = (data: EditAdHocTaskFormValues) => {
    if (!task) return;
    onSave(task.id, {
      desc: data.desc,
      details: data.details ?? "",
      kpi: data.kpi ?? "",
      comment: data.comment ?? "",
    });
    onOpenChange(false);
  };

  if (!task) return null;

  const descValue = form.watch("desc");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-none bg-gray-100/70 backdrop-blur-md border-gray-300/40 shadow-xl">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-4 py-2">
            <Controller
              name="desc"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className={LABEL_CLASS}>
                    Description
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="What needs to be done?"
                    className={FEILD_CLASS}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="details"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className={LABEL_CLASS}>
                    Details
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Additional context about this task"
                    className={FEILD_CLASS}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="kpi"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className={LABEL_CLASS}>
                    KPI Reference
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. Ledger Accuracy %"
                    className={FEILD_CLASS}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="comment"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className={LABEL_CLASS}>
                    Comment
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Optional note about this task"
                    rows={3}
                    className={FEILD_CLASS}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!descValue?.trim()}
              className="bg-[#16233F] text-white hover:bg-[#0F1A30] disabled:opacity-50"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
