import { z } from "zod";

import { InsertEntityPermissionSchema, UpdateEntityPermissionSchema } from "./permissions";

export const UpdateRandomTableSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    description: z
      .string()
      .transform((value) => value.trim())
      .nullable()
      .optional(),
    parent_id: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    is_folder: z.boolean().nullable().optional(),
    owner_id: z.string().optional(),
    is_public: z.boolean().nullable().optional(),
  }),
  relations: z
    .object({
      random_table_options: z
        .object({
          data: z.object({
            id: z.string(),
            title: z.string().transform((value) => value.trim()),
            description: z
              .string()
              .transform((value) => value.trim())
              .nullable()
              .optional(),
            icon: z.string().nullable().optional(),
            icon_color: z.string().nullable().optional(),
          }),
        })
        .array()
        .optional(),
    })
    .optional(),

  permissions: UpdateEntityPermissionSchema,
});

export const InsertRandomTableOptionSchema = z.object({
  data: z.object({
    title: z.string().transform((value) => value.trim()),
    description: z
      .string()
      .transform((value) => value.trim())
      .nullable()
      .optional(),

    character_id: z.string().optional().nullable(),
    blueprint_instance_id: z.string().optional().nullable(),
    document_id: z.string().optional().nullable(),
    map_id: z.string().optional().nullable(),
    map_pin_id: z.string().optional().nullable(),
    graph_id: z.string().optional().nullable(),
    event_id: z.string().optional().nullable(),
    word_id: z.string().optional().nullable(),
    image_id: z.string().optional().nullable(),
    icon: z.string().nullable().optional(),
    icon_color: z.string().nullable().optional(),
  }),
});
export const UpdateRandomTableOptionSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    description: z
      .string()
      .transform((value) => value.trim())
      .nullable()
      .optional(),
    character_id: z.string().optional().nullable(),
    blueprint_instance_id: z.string().optional().nullable(),
    document_id: z.string().optional().nullable(),
    map_id: z.string().optional().nullable(),
    map_pin_id: z.string().optional().nullable(),
    graph_id: z.string().optional().nullable(),
    event_id: z.string().optional().nullable(),
    word_id: z.string().optional().nullable(),
    image_id: z.string().optional().nullable(),
    icon: z.string().nullable().optional(),
    icon_color: z.string().nullable().optional(),
  }),
});

export const InsertRandomTableSchema = z.object({
  data: z.object({
    title: z.string().transform((value) => value.trim()),
    description: z
      .string()
      .transform((value) => value.trim())
      .nullable()
      .optional(),
    project_id: z.string(),
    parent_id: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    is_folder: z.boolean().nullable().optional(),
    is_public: z.boolean().nullable().optional(),
  }),
  relations: z
    .object({
      random_table_options: InsertRandomTableOptionSchema.array().optional(),
    })
    .optional(),

  permissions: InsertEntityPermissionSchema,
});

export type InsertRandomTableType = z.infer<typeof InsertRandomTableSchema>;
export type UpdateRandomTableType = z.infer<typeof UpdateRandomTableSchema>;

export type InsertRandomTableOptionType = z.infer<typeof InsertRandomTableOptionSchema>;
