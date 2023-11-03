import { z } from "zod";

export const InsertBlueprintInstanceSchema = z.object({
  data: z.object({
    parent_id: z.string(),
    title: z.string(),
    value: z
      .object({
        id: z.string(),
      })
      .array(),
  }),
  relations: z.object({
    tags: z.object({ id: z.string() }).array().optional().nullable(),
  }),
});
export const UpdateBlueprintInstanceSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
  }),
  relations: z.object({
    tags: z.object({ id: z.string() }).array().optional().nullable(),
  }),
});
