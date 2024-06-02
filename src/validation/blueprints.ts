import { z } from "zod";

import { InsertEntityPermissionSchema, UpdateEntityPermissionSchema } from "./permissions";

const BlueprintFieldTypeSchema = z.union([
  z.literal("text"),
  z.literal("textarea"),
  z.literal("boolean"),
  z.literal("number"),
  z.literal("select"),
  z.literal("select_multiple"),
  z.literal("dice_roll"),
  z.literal("date"),
  z.literal("random_table"),
  z.literal("documents_single"),
  z.literal("documents_multiple"),
  z.literal("images_single"),
  z.literal("images_multiple"),
  z.literal("locations_single"),
  z.literal("locations_multiple"),
  z.literal("characters_single"),
  z.literal("characters_multiple"),
  z.literal("blueprints_single"),
  z.literal("blueprints_multiple"),
  z.literal("events_single"),
  z.literal("events_multiple"),
]);

export const InsertBlueprintSchema = z.object({
  data: z.object({
    project_id: z.string(),
    title: z.string(),
    title_name: z.string(),
    icon: z.string().optional().nullable(),
  }),
  relations: z.object({
    blueprint_fields: z
      .object({
        title: z.string(),
        field_type: BlueprintFieldTypeSchema,
        sort: z.number().optional(),
        formula: z.string().optional().nullable(),
        options: z.object({ id: z.string(), value: z.string() }).array().optional(),
        random_table_id: z.string().optional().nullable(),
        calendar_id: z.string().optional().nullable(),
        blueprint_id: z.string().optional().nullable(),
      })
      .array(),
  }),
  permissions: InsertEntityPermissionSchema,
});

export const UpdateBlueprintSchema = z
  .object({
    data: z.object({
      id: z.string(),
      title: z.string().optional(),
      title_name: z.string().optional(),
      owner_id: z.string().optional(),
      icon: z.string().optional().nullable(),
    }),
    relations: z.object({
      blueprint_fields: z
        .object({
          id: z.string(),
          title: z.string().optional(),
          field_type: BlueprintFieldTypeSchema.optional(),
          sort: z.number().optional(),
          formula: z.string().optional().nullable(),
          options: z.object({ id: z.string(), value: z.string() }).array().optional(),
          random_table_id: z.string().optional().nullable(),
          calendar_id: z.string().optional().nullable(),
          blueprint_id: z.string().optional().nullable(),
        })
        .array()
        .optional(),
    }),
    permissions: UpdateEntityPermissionSchema,
  })
  .strict();

export type InsertBlueprintType = z.infer<typeof InsertBlueprintSchema>;
export type UpdateBlueprintType = z.infer<typeof UpdateBlueprintSchema>;
