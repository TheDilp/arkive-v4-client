import { z } from "zod";

import { InsertEntityPermissionSchema, UpdateEntityPermissionSchema } from "../permissions";

export const InsertWordSchema = z.object({
  data: z.object({
    title: z.string().transform((value) => value.trim()),
    translation: z.string().transform((value) => value.trim()),
    description: z
      .string()
      .transform((value) => value.trim())
      .nullable()
      .optional(),
    parent_id: z.string(),
  }),
  permissions: InsertEntityPermissionSchema,
});
export const UpdateWordSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    translation: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    owner_id: z.string().optional(),
    description: z
      .string()
      .transform((value) => value.trim())
      .nullable()
      .optional(),
  }),
  permissions: UpdateEntityPermissionSchema,
});
export type InsertWordType = z.infer<typeof InsertWordSchema>;
