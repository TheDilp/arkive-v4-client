import { z } from "zod";

export const InsertEraSchema = z.object({
  data: z.object({
    title: z.string().transform((value) => value.trim()),
    parent_id: z.string(),
    color: z.string().transform((value) => value.trim()),
    start_day: z.number(),
    start_month: z.number(),
    start_month_id: z.string(),
    start_year: z.number(),
    end_day: z.number(),
    end_month: z.number(),
    end_month_id: z.string(),
    end_year: z.number(),
  }),
});

export const UpdateEraSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    color: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    start_day: z.number().optional(),
    start_month: z.number().optional(),
    start_month_id: z.string(),
    start_year: z.number().optional(),
    end_day: z.number().optional(),
    end_month: z.number().optional(),
    end_month_id: z.string().optional(),
    end_year: z.number().optional(),
  }),
});
