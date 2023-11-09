import { z } from "zod";

export const InsertBlueprintInstanceSchema = z.object({
  data: z.object({
    parent_id: z.string(),
    title: z.string(),
  }),
  relations: z.object({
    tags: z.object({ id: z.string() }).array().optional().nullable(),
    blueprint_fields: z
      .object({
        id: z.string(),
        characters: z.object({ related_id: z.string() }).array().optional().nullable(),
        documents: z.object({ related_id: z.string() }).array().optional().nullable(),
        map_pins: z.object({ related_id: z.string() }).array().optional().nullable(),
        images: z.object({ related_id: z.string() }).array().optional().nullable(),
        blueprint_instances: z.object({ related_id: z.string() }).array().optional().nullable(),
        random_table: z
          .object({
            option_id: z.string().optional().nullable(),
            suboption_id: z.string().optional().nullable(),
            related_id: z.string(),
          })

          .optional()
          .nullable(),
        value: z
          .string()
          .or(z.number())
          .or(z.string().array())
          .or(z.number().array())
          .or(z.boolean())
          .or(z.null())
          .or(z.record(z.string(), z.any()))
          .optional()
          .nullable(),
      })
      .array()
      .optional(),
  }),
});
export const UpdateBlueprintInstanceSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
  }),
  relations: z.object({
    tags: z.object({ id: z.string() }).array().optional().nullable(),
    blueprint_fields: z
      .object({
        id: z.string(),
        characters: z.object({ related_id: z.string() }).array().optional().nullable(),
        documents: z.object({ related_id: z.string() }).array().optional().nullable(),
        map_pins: z.object({ related_id: z.string() }).array().optional().nullable(),
        images: z.object({ related_id: z.string() }).array().optional().nullable(),
        blueprint_instances: z.object({ related_id: z.string() }).array().optional().nullable(),
        random_table: z
          .object({
            option_id: z.string().optional().nullable(),
            suboption_id: z.string().optional().nullable(),
            related_id: z.string(),
          })
          .optional()
          .nullable(),
        calendar: z
          .object({
            start_day: z.number().optional().nullable(),
            start_month_id: z.string().optional().nullable(),
            start_year: z.number().optional().nullable(),
            end_day: z.number().optional().nullable(),
            end_month_id: z.string().optional().nullable(),
            end_year: z.number().optional().nullable(),
            related_id: z.string(),
          })

          .optional()
          .nullable(),
        value: z
          .string()
          .or(z.number())
          .or(z.string().array())
          .or(z.number().array())
          .or(z.boolean())
          .or(z.null())
          .or(z.record(z.string(), z.any()))
          .optional()
          .nullable(),
      })
      .array()
      .optional(),
  }),
});
