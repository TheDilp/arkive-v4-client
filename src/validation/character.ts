import { z } from "zod";

export const UpdateCharacterSchema = z.object({
  data: z.object({
    id: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().nullable().optional(),
    nickname: z.string().nullable().optional(),
    age: z.number().nullable().optional(),
    is_favorite: z.boolean().nullable().optional(),
    portrait_id: z.string().nullable().optional(),
    map_pin_id: z.string().nullable().optional(),
  }),
  relations: z.object({
    tags: z.object({ id: z.string() }).array().optional(),
    character_fields: z.object({ id: z.string(), value: z.string() }).array().optional(),
    related_to: z.object({ id: z.string(), relation_type: z.string() }).array().optional(),
    related_from: z.object({ id: z.string(), relation_type: z.string() }).array().optional(),
  }),
});
