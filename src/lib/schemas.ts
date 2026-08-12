import { z } from "zod";

export const categoryEnum = z.enum([
  "Finance",
  "Customer",
  "Process/Tech",
  "People",
]);

export const frequencyEnum = z.enum([
  "Once",
  "Weekly",
  "Bi-weekly",
  "Monthly",
  "Quarterly",
]);

export const adHocTaskFormSchema = z.object({
  desc: z.string().trim().min(1, "Description is required"),
  details: z.string().trim().optional(),
  category: categoryEnum,
  kpi: z.string().trim().optional(),
  frequency: frequencyEnum,
});

export const editAdHocTaskFormSchema = z.object({
  desc: z.string().trim().min(1, "Description is required"),
  details: z.string().trim().optional(),
  kpi: z.string().trim().optional(),
  comment: z.string().trim().optional(),
});

export const standardTaskFormSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  details: z.string().trim().optional(),
  category: categoryEnum,
  kpi: z.string().trim().optional(),
  frequency: frequencyEnum,
  deadline: z.string().min(1, "Deadline is required"),
});

export const patchInstanceSchema = z.object({
  status: z.enum(["COMPLETE", "INCOMPLETE"]).optional(),
  isActivated: z.boolean().optional(),
  comment: z.string().optional(),
});

export type AdHocTaskFormValues = z.infer<typeof adHocTaskFormSchema>;
export type EditAdHocTaskFormValues = z.infer<typeof editAdHocTaskFormSchema>;
export type StandardTaskFormValues = z.infer<typeof standardTaskFormSchema>;
