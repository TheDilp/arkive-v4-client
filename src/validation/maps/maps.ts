import { z } from "zod";

export const InsertMapSchema = z.object({
  data: z.object({
    title: z.string(),
    is_folder: z.boolean().nullable().optional(),
    is_public: z.boolean().nullable().optional(),
    cluster_pins: z.boolean().nullable().optional(),
    icon: z.string().nullable().optional(),
    project_id: z.string(),
    parent_id: z.string().nullable().optional(),
    image_id: z.string(),
  }),
  relations: z
    .object({
      tags: z.object({ id: z.string() }).array().optional(),
      characters: z.object({ id: z.string() }).array().optional(),
    })
    .optional(),
});

export const UpdateMapSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
    is_folder: z.boolean().nullable().optional(),
    is_public: z.boolean().nullable().optional(),
    cluster_pins: z.boolean().nullable().optional(),
    icon: z.string().nullable().optional(),
    parent_id: z.string().nullable().optional(),
    image_id: z.string().optional(),
  }),
  relations: z
    .object({
      tags: z.object({ id: z.string() }).array().optional(),
      characters: z.object({ id: z.string() }).array().optional(),
    })
    .optional(),
});

export type InsertMapType = z.infer<typeof InsertMapSchema>;
export type UpdateMapType = z.infer<typeof UpdateMapSchema>;
