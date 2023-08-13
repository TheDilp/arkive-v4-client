import { z } from "zod";

export const InsertRandomTableOptionSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  parent_id: z.string(),
  icon: z.string().nullable().optional(),
  icon_color: z.string().nullable().optional(),
});

export const InsertRandomTableSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  project_id: z.string(),
  parent_id: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  is_folder: z.boolean().nullable().optional(),
  is_public: z.boolean().nullable().optional(),
});
