import { z } from "zod";

export const InsertProjectSchema = z.object({
  data: z.object({
    auth_id: z.string(),
    title: z.string(),
    image_id: z.string().optional().nullable(),
  }),
});

export const UpdateProjectSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
    image_id: z.string().optional().nullable(),
    default_dice_color: z.string().optional(),
  }),
});

export type InsertProjectType = z.infer<typeof InsertProjectSchema>;
export type UpdateProjectType = z.infer<typeof UpdateProjectSchema>;
