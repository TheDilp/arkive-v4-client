import { z } from "zod";

export const InsertEventSchema = z.object({
  data: z.object({
    title: z.string(),
    parent_id: z.string(),
    description: z.string().optional().nullable(),
    is_public: z.boolean().optional().nullable(),
    background_color: z.string().optional().nullable(),
    text_color: z.string().optional().nullable(),
    startDay: z.number(),
    startMonth: z.number(),
    startYear: z.number(),
    endDay: z.number().optional().nullable(),
    endMonth: z.number().optional().nullable(),
    endYear: z.number().optional().nullable(),
    hours: z.number().optional().nullable(),
    minutes: z.number().optional().nullable(),

    document_id: z.string().optional().nullable(),
    image_id: z.string().optional().nullable(),
  }),
  relations: z
    .object({
      tags: z.object({ id: z.string() }).array().optional(),
    })
    .optional(),
});

export const UpdateEventSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional().nullable(),
    is_public: z.boolean().optional().nullable(),
    background_color: z.string().optional().nullable(),
    text_color: z.string().optional().nullable(),
    startDay: z.number().optional(),
    startMonth: z.number().optional(),
    startYear: z.number().optional(),
    endDay: z.number().optional().nullable(),
    endMonth: z.number().optional().nullable(),
    endYear: z.number().optional().nullable(),
    hours: z.number().optional().nullable(),
    minutes: z.number().optional().nullable(),

    document_id: z.string().optional().nullable(),
    image_id: z.string().optional().nullable(),
  }),
  relations: z
    .object({
      tags: z.object({ id: z.string() }).array().optional(),
    })
    .optional(),
});
