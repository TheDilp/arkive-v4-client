import { z } from "zod";

export const InsertBlueprintSchema = z.object({
  data: z.object({
    project_id: z.string(),
    title: z.string(),
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
    // tags: z.object({ id: z.string() }).array().min(1),
  }),
});

export const UpdateBlueprintSchema = z
  .object({
    data: z.object({
      id: z.string(),
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
      //   tags: z
      //     .object({
      //       id: z.string(),
      //     })
      //     .array()
      //     .optional(),
    }),
  })
  .strict();

export type InsertBlueprintType = z.infer<typeof InsertBlueprintSchema>;
export type UpdateBlueprintType = z.infer<typeof UpdateBlueprintSchema>;
