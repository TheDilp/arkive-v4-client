import { z } from "zod";

import { InsertEntityPermissionSchema, UpdateEntityPermissionSchema } from "../permissions";

export const InsertDictionarySchema = z.object({
  data: z.object({
    title: z.string().transform((value) => value.trim()),
    project_id: z.string(),
    icon: z.string().nullable().optional(),
    is_folder: z.boolean().nullable().optional(),
    is_public: z.boolean().nullable().optional(),
    parent_id: z.string().nullable().optional(),
  }),
  permissions: InsertEntityPermissionSchema,
});
export const UpdateDictionarySchema = z.object({
  data: z.object({
    id: z.string(),
    title: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    icon: z.string().nullable().optional(),
    is_folder: z.boolean().nullable().optional(),
    is_public: z.boolean().nullable().optional(),
    owner_id: z.string().optional(),
    parent_id: z.string().nullable().optional(),
  }),
  permissions: UpdateEntityPermissionSchema,
});

export type InsertDictionaryType = z.infer<typeof InsertDictionarySchema>;
export type UpdateDictionaryType = z.infer<typeof UpdateDictionarySchema>;
