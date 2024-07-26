import { z } from "zod";

const ManuscriptEntitySchema = z.object({
  id: z.string(),
  related_id: z.string(),
  sort: z.number(),
});

export const InsertManuscriptSchema = z.object({
  data: z.object({
    title: z.string().transform((value) => value.trim()),
    project_id: z.string(),
    icon: z.string().optional().nullable(),
    is_public: z.boolean().optional().nullable(),
  }),
  relations: z.object({
    tags: z.object({ id: z.string() }).array().optional(),
    characters: ManuscriptEntitySchema.array().optional().nullable(),
    blueprint_instances: ManuscriptEntitySchema.array().optional().nullable(),
    documents: ManuscriptEntitySchema.array().optional().nullable(),
    maps: ManuscriptEntitySchema.array().optional().nullable(),
    map_pins: ManuscriptEntitySchema.array().optional().nullable(),
    graphs: ManuscriptEntitySchema.array().optional().nullable(),
    events: ManuscriptEntitySchema.array().optional().nullable(),
    images: ManuscriptEntitySchema.array().optional().nullable(),
  }),
});
export const UpdateManuscriptSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    icon: z.string().optional().nullable(),
    is_public: z.boolean().optional().nullable(),
  }),
  relations: z.object({
    tags: z.object({ id: z.string() }).array().optional(),
    characters: ManuscriptEntitySchema.array().optional().nullable(),
    blueprint_instances: ManuscriptEntitySchema.array().optional().nullable(),
    documents: ManuscriptEntitySchema.array().optional().nullable(),
    maps: ManuscriptEntitySchema.array().optional().nullable(),
    map_pins: ManuscriptEntitySchema.array().optional().nullable(),
    graphs: ManuscriptEntitySchema.array().optional().nullable(),
    events: ManuscriptEntitySchema.array().optional().nullable(),
    images: ManuscriptEntitySchema.array().optional().nullable(),
  }),
});

export type InsertManuscriptType = z.infer<typeof InsertManuscriptSchema>;
export type UpdateManuscriptType = z.infer<typeof UpdateManuscriptSchema>;
