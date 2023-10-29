import { z } from "zod";

export const InsertBlueprintSchema = z.object({
  data: z.object({
    project_id: z.string(),
    title: z.string(),
    title_name: z.string(),
    // title_width: z.literal("half").or(z.literal("full")),
  }),
  relations: z.object({
    blueprint_fields: z
      .object({
        title: z.string(),
        field_type: z.string(),
        sort: z.number().optional(),
        // width: z.literal("half").or(z.literal("full")),
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
      title_name: z.string().optional(),
      // title_width: z.literal("half").or(z.literal("full")).optional(),
    }),
    relations: z.object({
      blueprint_fields: z
        .object({
          id: z.string(),
          title: z.string().optional(),
          field_type: z.string().optional(),
          // width: z.literal("half").or(z.literal("full")),
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
