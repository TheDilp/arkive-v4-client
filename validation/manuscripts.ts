import { z } from "zod";

const ManuscriptEntitySchema = z.object({
  id: z.string(),
  manuscript_id: z.string(),
  parent_id: z.string().nullable(),
  document_id: z.string().nullable(),
  character_id: z.string().nullable(),
  blueprint_instance_id: z.string().nullable(),
  map_id: z.string().nullable(),
  map_pin_id: z.string().nullable(),
  graph_id: z.string().nullable(),
  event_id: z.string().nullable(),
  image_id: z.string().nullable(),
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
    entities: ManuscriptEntitySchema.array().min(1),
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
    entities: ManuscriptEntitySchema.array().min(1),
  }),
});

export type InsertManuscriptType = z.infer<typeof InsertManuscriptSchema>;
export type UpdateManuscriptType = z.infer<typeof UpdateManuscriptSchema>;
