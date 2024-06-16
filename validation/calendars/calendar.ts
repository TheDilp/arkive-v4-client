import { z } from "zod";

import { InsertEntityPermissionSchema, UpdateEntityPermissionSchema } from "../permissions";
import { InsertEraSchema, UpdateEraSchema } from "./eras";
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
    eras: InsertEraSchema.array().optional(),
    months: InsertMonthSchema.array().min(1),
    tags: z.object({ id: z.string() }).array().optional(),
    leap_days: z
      .object({
        data: z.object({
          parent_id: z.string(),
          month_id: z.string(),
          conditions: z.object({
            and: z.object({ type: z.string(), value: z.string().or(z.number()) }).array(),
            or: z.object({ type: z.string(), value: z.string().or(z.number()) }).array(),
          }),
        }),
      })
      .array()
      .optional()
      .nullable(),
  }),
  permissions: InsertEntityPermissionSchema,
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
    hours: z.number().optional().nullable(),
    minutes: z.number().optional().nullable(),
    starts_on_day: z
      .string()
      .or(z.number())
      .optional()
      .nullable()
      .transform((arg) => {
        if (typeof arg === "string") return Number(arg);
        return arg;
      }),
    owner_id: z.string().optional(),
  }),
  relations: z.object({
    eras: UpdateEraSchema.array().or(UpdateEraSchema.array()).optional(),
    months: UpdateMonthSchema.array().min(1).or(InsertMonthSchema.array().min(1)),
    tags: z.object({ id: z.string() }).array().optional(),
    leap_days: z
      .object({
        data: z.object({
          parent_id: z.string(),
          month_id: z.string(),
          conditions: z.object({
            and: z.object({ type: z.string(), value: z.string().or(z.number()) }).array(),
            or: z.object({ type: z.string(), value: z.string().or(z.number()) }).array(),
          }),
        }),
      })
      .array()
      .optional()
      .nullable(),
  }),
  permissions: UpdateEntityPermissionSchema,
});

export type InsertCalendarType = z.infer<typeof InsertCalendarSchema>;
export type UpdateCalendarType = z.infer<typeof UpdateCalendarSchema>;
