import { z } from "zod";

const FilterTypes = z.literal("characters").or(z.literal("blueprint_instances"));

export const InsertFilterSchema = z.object({
  data: z.object({
    title: z.string(),
    content: z.any(),
    type: FilterTypes,
  }),
});

export type InsertFilterType = z.infer<typeof InsertFilterSchema>;
