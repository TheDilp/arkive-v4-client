import { z } from "zod";

export const InsertMonthSchema = z.object({
  data: z.object({
    title: z.string().transform((value) => value.trim()),
    days: z.number(),
    sort: z.number(),
    parent_id: z.string().optional(),
  }),
});
export const UpdateMonthSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    days: z.number().optional(),
    sort: z.number().optional(),
  }),
});
