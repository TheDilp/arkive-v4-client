import { z } from "zod";

export const InsertDictionarySchema = z.object({
  title: z.string(),
  project_id: z.string(),
  icon: z.string().nullable().optional(),
  is_folder: z.boolean().nullable().optional(),
  is_public: z.boolean().nullable().optional(),
  parent_id: z.string().nullable().optional(),
});
export const UpdateDictionarySchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  icon: z.string().nullable().optional(),
  is_folder: z.boolean().nullable().optional(),
  is_public: z.boolean().nullable().optional(),
  parent_id: z.string().nullable().optional(),
});

export type InsertDictionaryType = z.infer<typeof InsertDictionarySchema>;
export type UpdateDictionaryType = z.infer<typeof UpdateDictionarySchema>;
