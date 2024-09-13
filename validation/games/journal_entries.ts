import { z } from "zod";

const JournalEntryEntitySchema = z.object({
  id: z.string(),
  related_id: z.string(),
  sort: z.number(),
});

export const InsertJournalEntrySchema = z.object({
  data: z.object({
    title: z.string().transform((value) => value.trim()),
    game_id: z.string(),
  }),
  relations: z.object({
    tags: z.object({ id: z.string() }).array().optional(),
    characters: JournalEntryEntitySchema.array().optional().nullable(),
    blueprint_instances: JournalEntryEntitySchema.array().optional().nullable(),
    documents: JournalEntryEntitySchema.array().optional().nullable(),
    maps: JournalEntryEntitySchema.array().optional().nullable(),
    map_pins: JournalEntryEntitySchema.array().optional().nullable(),
    graphs: JournalEntryEntitySchema.array().optional().nullable(),
    events: JournalEntryEntitySchema.array().optional().nullable(),
    images: JournalEntryEntitySchema.array().optional().nullable(),
  }),
});
export const UpdateJournalEntrySchema = z.object({
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
    characters: JournalEntryEntitySchema.array().optional().nullable(),
    blueprint_instances: JournalEntryEntitySchema.array().optional().nullable(),
    documents: JournalEntryEntitySchema.array().optional().nullable(),
    maps: JournalEntryEntitySchema.array().optional().nullable(),
    map_pins: JournalEntryEntitySchema.array().optional().nullable(),
    graphs: JournalEntryEntitySchema.array().optional().nullable(),
    events: JournalEntryEntitySchema.array().optional().nullable(),
    images: JournalEntryEntitySchema.array().optional().nullable(),
  }),
});

export type InsertJournalEntryType = z.infer<typeof InsertJournalEntrySchema>;
export type UpdateJournalEntryType = z.infer<typeof UpdateJournalEntrySchema>;
