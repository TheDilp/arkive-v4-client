import { z } from "zod";

export const InsertWordSchema = z.object({
  data: z.object({
    title: z.string(),
    translation: z.string(),
    description: z.string().nullable().optional(),
    parent_id: z.string(),
  }),
});
export type InsertWordType = z.infer<typeof InsertWordSchema>;
// export type UpdateDictionaryType = z.infer<typeof UpdateDictionarySchema>;
