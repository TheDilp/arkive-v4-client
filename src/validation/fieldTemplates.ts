import { z } from "zod";

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
        project_id: z.string(),
        field_type: z.string(),
        sort: z.number().optional(),
        formula: z.string().optional().nullable(),
        options: z.object({ id: z.string(), value: z.string() }).array().optional(),
        random_table_id: z.string().optional().nullable(),
        calendar_id: z.string().optional().nullable(),
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
          field_type: z.string().optional(),
          project_id: z.string(),
          sort: z.number().optional(),
          formula: z.string().optional().nullable(),
          options: z.object({ id: z.string(), value: z.string() }).array().optional(),
          random_table_id: z.string().optional().nullable(),
          calendar_id: z.string().optional().nullable(),
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
