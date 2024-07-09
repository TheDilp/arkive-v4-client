import { z } from "zod";

import { InsertEntityPermissionSchema, UpdateEntityPermissionSchema } from "../permissions";

export const InsertEventSchema = z.object({
  data: z.object({
    title: z.string().transform((value) => value.trim()),
    parent_id: z.string(),
    description: z
      .string()
      .transform((value) => value.trim())
      .optional()
      .nullable(),
    is_public: z.boolean().optional().nullable(),
    background_color: z
      .string()
      .transform((value) => value.trim())
      .optional()
      .nullable(),
    text_color: z
      .string()
      .transform((value) => value.trim())
      .optional()
      .nullable(),
    start_day: z.number(),
    start_month: z.number(),
    start_month_id: z.string(),
    start_year: z.number(),
    end_day: z.number().optional().nullable(),
    end_month: z.number().optional().nullable(),
    end_month_id: z.string().nullable().optional(),
    end_year: z.number().optional().nullable(),
    start_hours: z.number().optional().nullable(),
    start_minutes: z.number().optional().nullable(),
    end_hours: z.number().optional().nullable(),
    end_minutes: z.number().optional().nullable(),

    document_id: z.string().optional().nullable(),
    image_id: z.string().optional().nullable(),
  }),
  relations: z
    .object({
      tags: z.object({ id: z.string() }).array().optional(),
      characters: z.object({ id: z.string() }).array().optional(),
      map_pins: z.object({ id: z.string() }).array().optional(),
    })
    .optional(),
  permissions: InsertEntityPermissionSchema,
});

export const UpdateEventSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    description: z
      .string()
      .transform((value) => value.trim())
      .optional()
      .nullable(),
    is_public: z.boolean().optional().nullable(),
    background_color: z
      .string()
      .transform((value) => value.trim())
      .optional()
      .nullable(),
    text_color: z
      .string()
      .transform((value) => value.trim())
      .optional()
      .nullable(),
    start_day: z.number().optional(),
    start_month: z.number().optional(),
    start_month_id: z.string(),
    start_year: z.number().optional(),
    end_day: z.number().optional().nullable(),
    end_month: z.number().optional().nullable(),
    end_month_id: z.string().nullable().optional(),
    end_year: z.number().optional().nullable(),
    start_hours: z.number().optional().nullable(),
    start_minutes: z.number().optional().nullable(),
    end_hours: z.number().optional().nullable(),
    end_minutes: z.number().optional().nullable(),
    owner_id: z.string().optional(),
    document_id: z.string().optional().nullable(),
    image_id: z.string().optional().nullable(),
  }),
  relations: z
    .object({
      tags: z.object({ id: z.string() }).array().optional(),
      characters: z.object({ id: z.string() }).array().optional(),
      map_pins: z.object({ id: z.string() }).array().optional(),
    })
    .optional(),
  permissions: UpdateEntityPermissionSchema,
});
