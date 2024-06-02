import { z } from "zod";

import { InsertEntityPermissionSchema, UpdateEntityPermissionSchema } from "../permissions";

export const InsertWordSchema = z.object({
  data: z.object({
    title: z.string(),
    translation: z.string(),
    description: z.string().nullable().optional(),
    parent_id: z.string(),
  }),
  permissions: InsertEntityPermissionSchema,
});
export const UpdateWordSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
    translation: z.string().optional(),
    owner_id: z.string().optional(),
    description: z.string().nullable().optional(),
  }),
  permissions: UpdateEntityPermissionSchema,
});
export type InsertWordType = z.infer<typeof InsertWordSchema>;
