import { z } from "zod";

export const InsertWordSchema = z.object({
  data: z.object({
    title: z.string(),
    translation: z.string(),
    description: z.string().nullable().optional(),
    parent_id: z.string(),
  }),
});
export const UpdateWordSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
    translation: z.string().optional(),
    description: z.string().nullable().optional(),
  }),
});
export type InsertWordType = z.infer<typeof InsertWordSchema>;
export type UpdateWordType = z.infer<typeof UpdateWordSchema>;
