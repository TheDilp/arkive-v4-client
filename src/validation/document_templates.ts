import { z } from "zod";

export const InsertDocumentTemplateFieldSchema = z.object({
  data: z.object({
    key: z.string(),
    entity_type: z.string(),
    value: z.string(),
    formula: z.string().nullable(),
    derive: z.object({ derive_from: z.string(), derive_formula: z.string() }).nullable(),
    is_randomized: z.boolean().nullable(),
  }),
});

export const InsertDocumentTemplateSchema = z.object({
  data: z.object({
    project_id: z.string(),
    title: z.string(),
  }),
  relations: z
    .object({
      fields: InsertDocumentTemplateFieldSchema.array(),
    })
    .optional(),
});
