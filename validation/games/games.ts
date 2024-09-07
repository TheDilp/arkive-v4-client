import { z } from "zod";

export const InsertGameSchema = z.object({
  data: z.object({
    title: z.string(),
    project_id: z.string(),
    next_session_date: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
  }),
});

export type InsertGameType = z.infer<typeof InsertGameSchema>;
