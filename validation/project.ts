import { z } from "zod";

const ProjectFontSchema = z.enum([
  "Arial",
  "Courier New",
  "Comic Sans",
  "Fantasy",
  "Garamond",
  "Georgia",
  "Lato",
  "Merriweather",
  "Tahoma",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
]);

export const InsertProjectSchema = z.object({
  data: z.object({
    title: z.string().transform((value) => value.trim()),
    description: z
      .string()
      .transform((value) => value.trim())
      .optional()
      .nullable(),
    default_project_font: ProjectFontSchema.default("Lato"),
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
    default_project_font: ProjectFontSchema.default("Lato"),
  }),
  relations: z
    .object({
      feature_flags: z.any().nullable().optional(),
    })
    .optional(),
});

export type InsertProjectType = z.infer<typeof InsertProjectSchema>;
export type UpdateProjectType = z.infer<typeof UpdateProjectSchema>;
