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
        random_tables: z
          .object({
            option_id: z.string().optional().nullable(),
            suboption_id: z.string().optional().nullable(),
            related_id: z.string(),
          })
          .array()
          .optional()
          .nullable(),
        value: z.string().or(z.number()).or(z.string().array()).or(z.number().array()).or(z.null()).optional().nullable(),
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
        random_tables: z
          .object({
            option_id: z.string().optional().nullable(),
            suboption_id: z.string().optional().nullable(),
            related_id: z.string(),
          })
          .array()
          .optional()
          .nullable(),
        value: z.string().or(z.number()).or(z.string().array()).or(z.number().array()).or(z.null()).optional().nullable(),
      })
      .array()
      .optional(),
  }),
});
