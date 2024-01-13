import { z } from "zod";

const FieldTypeSchema = z.union([
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
  z.literal("blueprints_single"),
  z.literal("blueprints_multiple"),
  z.literal("events_single"),
  z.literal("events_multiple"),
]);

export const InsertTemplateSchema = z.object({
  data: z.object({
    project_id: z.string(),
    title: z.string(),
    sort: z.number().optional(),
  }),
  relations: z.object({
    character_fields: z
      .object({
        title: z.string(),
        field_type: FieldTypeSchema,
        sort: z.number().optional(),
        formula: z.string().optional().nullable(),
        options: z.object({ id: z.string(), value: z.string() }).array().optional(),
        random_table_id: z.string().optional().nullable(),
        calendar_id: z.string().optional().nullable(),
        blueprint_id: z.string().optional().nullable(),
      })
      .array(),
    tags: z.object({ id: z.string() }).array().min(1),
  }),
});

export const UpdateTemplateSchema = z
  .object({
    data: z.object({
      id: z.string(),
      sort: z.number().optional(),
      title: z.string().optional(),
    }),
    relations: z.object({
      character_fields: z
        .object({
          id: z.string(),
          title: z.string().optional(),
          field_type: FieldTypeSchema.optional(),
          sort: z.number().optional(),
          formula: z.string().optional().nullable(),
          options: z.object({ id: z.string(), value: z.string() }).array().optional(),
          random_table_id: z.string().optional().nullable(),
          calendar_id: z.string().optional().nullable(),
          blueprint_id: z.string().optional().nullable(),
        })
        .array()
        .optional(),
      tags: z
        .object({
          id: z.string(),
        })
        .array()
        .optional(),
    }),
  })
  .strict();

export type InsertTemplateType = z.infer<typeof InsertTemplateSchema>;
export type UpdateTemplateType = z.infer<typeof UpdateTemplateSchema>;
