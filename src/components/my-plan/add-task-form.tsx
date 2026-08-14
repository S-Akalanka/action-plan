"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/categories";
import type { CategoryKey } from "@/lib/types";
import { adHocTaskFormSchema, type AdHocTaskFormValues } from "@/lib/schemas";

const FREQUENCIES = ["Once", "Weekly", "Bi-weekly", "Monthly", "Quarterly"] as const;

const LABEL_CLASS = "mb-1.5 block text-xs uppercase tracking-wider text-[#9AA3B2]";

export function AddAdHocTaskForm({
  onSave,
  onCancel,
}: {
  onSave: (data: {
    desc: string;
    details: string;
    category: CategoryKey;
    kpi: string;
    frequency: (typeof FREQUENCIES)[number];
  }) => void;
  onCancel: () => void;
}) {
  const form = useForm<AdHocTaskFormValues>({
    resolver: zodResolver(adHocTaskFormSchema),
    defaultValues: {
      desc: "",
      details: "",
      category: CATEGORIES[0].key,
      kpi: "",
      frequency: "Once",
    },
  });

  const handleSubmit = (data: AdHocTaskFormValues) => {
    onSave({
      desc: data.desc,
      details: data.details ?? "",
      category: data.category,
      kpi: data.kpi || "—",
      frequency: data.frequency,
    });
    form.reset();
  };

  return (
    <div className="rounded-xl border border-[#16233F] bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-[#16233F]">New ad-hoc task</h3>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Controller
            name="desc"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="md:col-span-2" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name} className={LABEL_CLASS}>
                  Description
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="What needs to be done?"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="category"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name} className={LABEL_CLASS}>
                  Category
                </FieldLabel>
                <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
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
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="frequency"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name} className={LABEL_CLASS}>
                  Frequency
                </FieldLabel>
                <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
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
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="details"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="md:col-span-2" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name} className={LABEL_CLASS}>
                  Details (optional)
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Additional context about this task"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="kpi"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="md:col-span-3" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name} className={LABEL_CLASS}>
                  KPI reference (optional)
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. Ledger Accuracy %"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#16233F] text-white hover:bg-[#0F1A30]">
            Save task
          </Button>
        </div>
      </form>
    </div>
  );
}
