import { z } from "zod";

export const InsertMonthSchema = z.object({
  data: z.object({
    title: z.string(),
    days: z.number(),
    sort: z.number(),
    parent_id: z.string().optional(),
  }),
});
export const UpdateMonthSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
    days: z.number().optional(),
    owner_id: z.string().optional(),
    sort: z.number().optional(),
  }),
});
