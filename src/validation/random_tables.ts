import { z } from "zod";

export const UpdateRandomTableSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().nullable().optional(),
    parent_id: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    is_folder: z.boolean().nullable().optional(),
    is_public: z.boolean().nullable().optional(),
  }),
  relations: z
    .object({
      random_table_options: z
        .object({
          data: z.object({
            id: z.string(),
            title: z.string(),
            description: z.string().nullable().optional(),
            icon: z.string().nullable().optional(),
            icon_color: z.string().nullable().optional(),
          }),
        })
        .array()
        .optional(),
    })
    .optional(),
});

export const RandomTableSubOptionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  parent_id: z.string(),
});

export const InsertRandomTableOptionSchema = z.object({
  data: z.object({
    title: z.string(),
    description: z.string().nullable().optional(),
    parent_id: z.string(),
    icon: z.string().nullable().optional(),
    icon_color: z.string().nullable().optional(),
  }),
});
export const UpdateRandomTableOptionSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    icon_color: z.string().nullable().optional(),
    suboptions: RandomTableSubOptionSchema.array().optional(),
  }),
  relations: z.object({
    suboptions: RandomTableSubOptionSchema.array().optional(),
  }),
});

export const InsertRandomTableSchema = z.object({
  data: z.object({
    title: z.string(),
    description: z.string().nullable().optional(),
    project_id: z.string(),
    parent_id: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    is_folder: z.boolean().nullable().optional(),
    is_public: z.boolean().nullable().optional(),
  }),
  relations: z
    .object({
      random_table_options: z
        .object({
          data: z.object({
            title: z.string(),
            description: z.string().nullable().optional(),
            icon: z.string().nullable().optional(),
            icon_color: z.string().nullable().optional(),
          }),
        })
        .array()
        .optional(),
    })
    .optional(),
});

export type InsertRandomTableType = z.infer<typeof InsertRandomTableSchema>;
export type UpdateRandomTableType = z.infer<typeof UpdateRandomTableSchema>;

export type InsertRandomTableOptionType = z.infer<typeof InsertRandomTableOptionSchema>;
export type UpdateRandomTableOptionType = z.infer<typeof UpdateRandomTableOptionSchema>;
