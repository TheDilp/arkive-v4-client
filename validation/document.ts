import { z } from "zod";

import { InsertEntityPermissionSchema, UpdateEntityPermissionSchema } from "./permissions";

const DeriveFormulas = z.literal("dnd_5e_ability_bonus");
const RandomCountOptions = z
  .union([
    z.literal("single"),
    z.literal("max_2"),
    z.literal("max_3"),
    z.literal("max_4"),
    z.literal("max_5"),
    z.literal("max_6"),
    z.literal("max_7"),
    z.literal("max_8"),
    z.literal("max_9"),
    z.literal("max_10"),
    z.literal("max_15"),
    z.literal("max_20"),
  ])
  .optional();

export const InsertDocumentTemplateFieldSchema = z.object({
  blueprint_id: z.string().optional().nullable(),
  map_id: z.string().optional().nullable(),
  calendar_id: z.string().optional().nullable(),
  dictionary_id: z.string().optional().nullable(),
  key: z.string(),
  entity_type: z.string(),
  value: z
    .string()
    .transform((value) => value.trim())
    .nullable(),
  formula: z
    .string()
    .transform((value) => value.trim())
    .nullable(),
  derive_from: z.string().nullable(),
  derive_formula: DeriveFormulas.nullable(),
  is_randomized: z.boolean().nullable(),
  related: z.string().array(),
  random_count: RandomCountOptions.nullable(),
  sort: z.number(),
  additional_data: z.record(z.string(), z.string().or(z.number())).optional().nullable(),
});
export const UpdateDocumentTemplateFieldSchema = z.object({
  id: z.string(),
  blueprint_id: z.string().optional().nullable(),
  map_id: z.string().optional().nullable(),
  calendar_id: z.string().optional().nullable(),
  dictionary_id: z.string().optional().nullable(),
  key: z.string().transform((value) => value.trim()),
  entity_type: z.string(),
  value: z
    .string()
    .transform((value) => value.trim())
    .nullable(),
  formula: z
    .string()
    .transform((value) => value.trim())
    .nullable(),
  derive_from: z.string().nullable(),
  derive_formula: DeriveFormulas.nullable(),
  is_randomized: z.boolean().nullable(),
  related: z.string().array(),
  random_count: RandomCountOptions.nullable(),
  sort: z.number(),
  additional_data: z.record(z.string(), z.string().or(z.number())).optional().nullable(),
});

export const InsertDocumentSchema = z.object({
  data: z.object({
    id: z.string().optional(),
    project_id: z.string(),
    title: z.string().transform((value) => value.trim()),
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

      template_fields: InsertDocumentTemplateFieldSchema.array().optional().nullable(),
    })
    .optional(),
  permissions: InsertEntityPermissionSchema,
});
export const UpdateDocumentSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    content: z.object({}).nullable().optional(),
    icon: z.string().nullable().optional(),
    is_folder: z.boolean().nullable().optional(),
    is_public: z.boolean().nullable().optional(),
    is_template: z.boolean().nullable().optional(),
    parent_id: z.string().nullable().optional(),
    image_id: z.string().nullable().optional(),
    dice_color: z.string().nullable().optional(),
    owner_id: z.string().optional(),
  }),
  relations: z
    .object({
      tags: z.object({ id: z.string() }).array().optional(),
      template_fields: UpdateDocumentTemplateFieldSchema.array().optional().nullable(),
    })
    .optional(),
  permissions: UpdateEntityPermissionSchema,
});

export type InsertDocumentType = z.infer<typeof InsertDocumentSchema>;
export type UpdateDocumentType = z.infer<typeof UpdateDocumentSchema>;
