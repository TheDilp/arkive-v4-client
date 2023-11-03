import { z } from "zod";

export const InsertBlueprintInstanceSchema = z.object({
  data: z.object({
    parent_id: z.string(),
    title: z.string(),
  }),
  relations: z.object({
    tags: z.object({ id: z.string() }).array().optional().nullable(),
    blueprint_fields: z
      .object({
        id: z.string(),
        value: z.object({
          value: z.string().or(z.string().array()).or(z.number()).or(z.boolean()).or(z.record(z.any())),
          subOptionValue: z.string().optional(),
        }),
      })
      .array()
      .optional(),
  }),
});
export const UpdateBlueprintInstanceSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
  }),
  relations: z.object({
    tags: z.object({ id: z.string() }).array().optional().nullable(),
    blueprint_fields: z
      .object({
        id: z.string(),
        value: z.object({
          value: z.string().or(z.string().array()).or(z.number()).or(z.boolean()).or(z.record(z.any())),
          subOptionValue: z.string().optional(),
        }),
      })
      .array()
      .optional(),
  }),
});
