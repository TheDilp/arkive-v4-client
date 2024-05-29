import { z } from "zod";

export const InsertDocumentTemplateFieldSchema = z.object({
  data: z.object({
    key: z.string(),
    entity_type: z.string(),
    value: z.string(),
    formula: z.string().nullable(),
    derive_from: z.string().nullable(),
    derive_formula: z.string().nullable(),
    is_randomized: z.boolean().nullable(),
  }),
});
export const UpdateDocumentTemplateFieldSchema = z.object({
  data: z.object({
    id: z.string(),
    key: z.string(),
    entity_type: z.string(),
    value: z.string(),
    formula: z.string().nullable(),
    derive_from: z.string().nullable(),
    derive_formula: z.string().nullable(),
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
      fields: InsertDocumentTemplateFieldSchema.array().min(1),
    })
    .optional(),
});
export const UpdateDocumentTemplateSchema = z.object({
  data: z.object({
    id: z.string(),
    project_id: z.string(),
    title: z.string().optional().nullable(),
  }),
  relations: z.object({
    fields: UpdateDocumentTemplateFieldSchema.array().min(1).optional().nullable(),
  }),
});
export type UpdateDocumentTemplateType = z.infer<typeof UpdateDocumentTemplateSchema>;
