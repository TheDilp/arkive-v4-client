import { z } from "zod";

export const InsertConversationSchema = z.object({
  data: z.object({
    title: z.string(),
    project_id: z.string(),
  }),
  relations: z.object({
    characters: z
      .array(
        z.object({
          id: z.string(),
        }),
      )
      .min(1),
  }),
});

export const UpdateConversationSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
  }),
  relations: z.object({
    characters: z
      .array(
        z.object({
          id: z.string(),
        }),
      )
      .optional(),
  }),
});

export type InsertConversationType = z.infer<typeof InsertConversationSchema>;
export type UpdateConversationType = z.infer<typeof UpdateConversationSchema>;
