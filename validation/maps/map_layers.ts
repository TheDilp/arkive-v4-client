import { z } from "zod";

export const InsertMapLayerSchema = z.object({
  data: z.object({
    parent_id: z.string(),
    title: z.string().transform((value) => value.trim()),
    is_public: z.boolean().nullable().optional(),
    image_id: z.string(),
  }),
});

export const UpdateMapLayerSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z
      .string()
      .transform((value) => value.trim())
      .nullable()
      .optional(),
    is_public: z.boolean().nullable().optional(),
    image_id: z.string().nullable().optional(),
  }),
});
