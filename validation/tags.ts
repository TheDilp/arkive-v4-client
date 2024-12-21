import { z } from "zod";

import { InsertEntityPermissionSchema } from "./permissions";

export const InsertTagSchema = z.object({
  data: z
    .object({
      title: z.string().transform((value) => value.trim()),
      color: z.string().transform((value) => value.trim()),
    })
    .array(),
  permissions: InsertEntityPermissionSchema,
});

export type InsertTagType = z.infer<typeof InsertTagSchema>;
// export type UpdateTagType = z.infer<typeof UpdateTagSchema>;
