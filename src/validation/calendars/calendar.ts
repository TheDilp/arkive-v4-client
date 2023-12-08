import { z } from "zod";

import { InsertMonthSchema, UpdateMonthSchema } from "./month";

export const InsertCalendarSchema = z.object({
  data: z.object({
    title: z.string(),
    is_folder: z.boolean().nullable().optional(),
    is_public: z.boolean().nullable().optional(),
    icon: z.string().nullable().optional(),
    project_id: z.string(),
    starts_on_day: z
      .string()
      .or(z.number())
      .optional()
      .nullable()
      .transform((arg) => {
        if (typeof arg === "string") return Number(arg);
        return arg;
      }),
    // offset: z.number(),
    hours: z.number().optional().nullable(),
    minutes: z.number().optional().nullable(),
    parent_id: z.string().nullable().optional(),
    days: z.string().array().min(1),
  }),
  relations: z.object({
    months: InsertMonthSchema.array().min(1),
    tags: z.object({ id: z.string() }).array().optional(),
    leap_days: z
      .object({ parent_id: z.string(), month_id: z.string(), conditions: z.string().optional().nullable() })
      .array()
      .optional()
      .nullable(),
  }),
});

export const UpdateCalendarSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
    is_folder: z.boolean().nullable().optional(),
    is_public: z.boolean().nullable().optional(),
    icon: z.string().nullable().optional(),
    parent_id: z.string().nullable().optional(),
    days: z.string().array().min(1).optional(),
    starts_on_day: z
      .string()
      .or(z.number())
      .optional()
      .nullable()
      .transform((arg) => {
        if (typeof arg === "string") return Number(arg);
        return arg;
      }),
  }),
  relations: z.object({
    months: InsertMonthSchema.array().min(1).or(UpdateMonthSchema.array().min(1)),
    tags: z.object({ id: z.string() }).array().optional(),
    leap_days: z
      .object({ parent_id: z.string(), month_id: z.string(), conditions: z.string().optional().nullable() })
      .array()
      .optional()
      .nullable(),
  }),
});

export type InsertCalendarType = z.infer<typeof InsertCalendarSchema>;
export type UpdateCalendarType = z.infer<typeof UpdateCalendarSchema>;
