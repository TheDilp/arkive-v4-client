import { z } from "zod";

export const InsertProjectSchema = z.object({
  data: z.object({
    owner_id: z.string(),
    title: z.string(),
    image: z.string().optional(),
  }),
});

export const UpdateProjectSchema = z.object({
  title: z.string().optional(),
  image: z.string().optional(),
});

export type InsertProjectType = z.infer<typeof InsertProjectSchema>;
export type UpdateProjectType = z.infer<typeof UpdateProjectSchema>;
