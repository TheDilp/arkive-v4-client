import { z } from "zod";

export const BulkAccessUpdateSchema = z.object({
  data: z.object({
    permissions: z
      .object({
        related_id: z.string(),
      })
      .and(
        z
          .object({
            permission_id: z.string(),
            user_id: z.string(),
            role_id: z.null(),
          })
          .or(z.object({ role_id: z.string(), permission_id: z.null(), user_id: z.null() })),
      )
      .or(
        z.object({
          related_id: z.string(),
          role_id: z.null(),
          permission_id: z.null(),
          user_id: z.null(),
        }),
      )
      .array(),
  }),
});
