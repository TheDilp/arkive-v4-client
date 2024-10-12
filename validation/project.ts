import { z } from "zod";

export const InsertProjectSchema = z.object({
  data: z.object({
    title: z.string().transform((value) => value.trim()),
    description: z
      .string()
      .transform((value) => value.trim())
      .optional()
      .nullable(),
  }),
});

export const UpdateProjectSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    description: z
      .string()
      .transform((value) => value.trim())
      .optional()
      .nullable(),
    is_public: z.boolean().nullable().optional(),
    image_id: z.string().optional().nullable(),
    default_dice_color: z.string().optional().nullable(),
    game_system_id: z.string().optional().nullable(),
  }),
  relations: z
    .object({
      feature_flags: z.any().nullable().optional(),
    })
    .optional(),
});

export type InsertProjectType = z.infer<typeof InsertProjectSchema>;
export type UpdateProjectType = z.infer<typeof UpdateProjectSchema>;
