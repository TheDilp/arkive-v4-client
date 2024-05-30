import { z } from "zod";

import { InsertEntityPermissionSchema, UpdateEntityPermissionSchema } from "./permissions";

export const InsertDocumentTemplateFieldSchema = z.object({
  key: z.string(),
  entity_type: z.string(),
  value: z.string().nullable(),
  formula: z.string().nullable(),
  derive_from: z.string().nullable(),
  derive_formula: z.string().nullable(),
  is_randomized: z.boolean().nullable(),
  sort: z.number(),
});
export const UpdateDocumentTemplateFieldSchema = z.object({
  id: z.string(),
  key: z.string(),
  entity_type: z.string(),
  value: z.string().nullable(),
  formula: z.string().nullable(),
  derive_from: z.string().nullable(),
  derive_formula: z.string().nullable(),
  is_randomized: z.boolean().nullable(),
  sort: z.number(),
});

export const InsertDocumentSchema = z.object({
  data: z.object({
    id: z.string().optional(),
    project_id: z.string(),
    title: z.string(),
    content: z.object({}).nullable().optional(),
    icon: z.string().nullable().optional(),
    is_folder: z.boolean().nullable().optional(),
    is_public: z.boolean().nullable().optional(),
    is_template: z.boolean().nullable().optional(),
    parent_id: z.string().nullable().optional(),
    image_id: z.string().nullable().optional(),
    dice_color: z.string().nullable().optional(),
  }),
  relations: z
    .object({
      tags: z.object({ id: z.string() }).array().optional(),
      alter_names: z.object({ title: z.string() }).array().optional(),
      template_fields: InsertDocumentTemplateFieldSchema.array().optional().nullable(),
    })
    .optional(),
  permissions: InsertEntityPermissionSchema,
});
export const UpdateDocumentSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
    content: z.object({}).nullable().optional(),
    icon: z.string().nullable().optional(),
    is_folder: z.boolean().nullable().optional(),
    is_public: z.boolean().nullable().optional(),
    is_template: z.boolean().nullable().optional(),
    parent_id: z.string().nullable().optional(),
    image_id: z.string().nullable().optional(),
    dice_color: z.string().nullable().optional(),
  }),
  relations: z
    .object({
      alter_names: z.object({ title: z.string(), project_id: z.string() }).array().optional(),
      tags: z.object({ id: z.string() }).array().optional(),
      template_fields: UpdateDocumentTemplateFieldSchema.array().optional().nullable(),
    })
    .optional(),
  permissions: UpdateEntityPermissionSchema,
});
