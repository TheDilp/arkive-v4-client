import { z } from "zod";

const FilterTypes = z.literal("characters").or(z.literal("blueprint_instances"));

export const InsertFilterSchema = z.object({
  data: z.object({
    title: z.string(),
    content: z.any(),
    is_favorite: z.boolean().optional().nullable(),
    type: FilterTypes,
  }),
});
export const UpdateFilterSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
    content: z.any().optional(),
    is_favorite: z.boolean().optional().nullable(),
  }),
});

export type InsertFilterType = z.infer<typeof InsertFilterSchema>;
export type UpdateFilterType = z.infer<typeof UpdateFilterSchema>;
