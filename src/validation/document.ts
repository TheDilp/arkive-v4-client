import { z } from "zod";

export const InsertDocumentSchema = z.object({
  data: z.object({
    project_id: z.string(),
    title: z.string(),
    content: z.string().nullable().optional(),
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
    })
    .optional(),
});
export const UpdateDocumentSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
    content: z.string().nullable().optional(),
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
      alter_names: z.object({ title: z.string(), project_id: z.string() }).array().optional(),
    })
    .optional(),
});
