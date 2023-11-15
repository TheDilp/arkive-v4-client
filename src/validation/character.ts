import { z } from "zod";

export const InsertCharacterSchema = z.object({
  data: z.object({
    first_name: z.string(),
    project_id: z.string(),
    last_name: z.string().nullable().optional(),
    nickname: z.string().nullable().optional(),
    age: z.number().nullable().optional(),
    portrait_id: z
      .string()
      .nullable()
      .optional()
      .transform((val) => {
        if (val === "") return null;
        return val;
      }),
    map_pin_id: z.string().nullable().optional(),
    is_favorite: z.boolean().nullable().optional(),
  }),
  relations: z.object({
    tags: z.object({ id: z.string() }).array().optional(),
    character_fields: z
      .object({
        id: z.string(),
        documents: z.object({ related_id: z.string() }).array().optional().nullable(),
        map_pins: z.object({ related_id: z.string() }).array().optional().nullable(),
        images: z.object({ related_id: z.string() }).array().optional().nullable(),
        blueprint_instances: z.object({ related_id: z.string() }).array().optional().nullable(),
        random_table: z
          .object({
            option_id: z.string().optional().nullable(),
            suboption_id: z.string().optional().nullable(),
            related_id: z.string(),
          })

          .optional()
          .nullable(),
        value: z
          .string()
          .or(z.number())
          .or(z.string().array())
          .or(z.number().array())
          .or(z.boolean())
          .or(z.null())
          .or(z.record(z.string(), z.any()))
          .optional()
          .nullable(),
      })
      .array()
      .optional(),
    related_to: z.object({ id: z.string(), relation_type_id: z.string() }).array().optional(),
    related_from: z.object({ id: z.string(), relation_type_id: z.string() }).array().optional(),
    related_other: z.object({ id: z.string(), relation_type_id: z.string() }).array().optional(),
  }),
});

export const UpdateCharacterSchema = z.object({
  data: z.object({
    id: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().nullable().optional(),
    nickname: z.string().nullable().optional(),
    age: z.number().nullable().optional(),
    is_favorite: z.boolean().nullable().optional(),
    portrait_id: z
      .string()
      .nullable()
      .optional()
      .transform((val) => {
        if (val === "") return null;
        return val;
      }),
    map_pin_id: z.string().nullable().optional(),
  }),
  relations: z.object({
    tags: z.object({ id: z.string() }).array().optional(),
    character_fields: z
      .object({
        id: z.string(),
        documents: z.object({ related_id: z.string() }).array().optional().nullable(),
        map_pins: z.object({ related_id: z.string() }).array().optional().nullable(),
        images: z.object({ related_id: z.string() }).array().optional().nullable(),
        blueprint_instances: z.object({ related_id: z.string() }).array().optional().nullable(),
        random_table: z
          .object({
            option_id: z.string().optional().nullable(),
            suboption_id: z.string().optional().nullable(),
            related_id: z.string(),
          })

          .optional()
          .nullable(),
        value: z
          .string()
          .or(z.number())
          .or(z.string().array())
          .or(z.number().array())
          .or(z.boolean())
          .or(z.null())
          .or(z.record(z.string(), z.any()))
          .optional()
          .nullable(),
      })
      .array()
      .optional(),
    related_to: z
      .object({ id: z.string(), relation_type_id: z.string(), character_relationship_id: z.string().optional() })
      .array()
      .optional(),
    related_from: z
      .object({ id: z.string(), relation_type_id: z.string(), character_relationship_id: z.string().optional() })
      .array()
      .optional(),
    related_other: z
      .object({ id: z.string(), relation_type_id: z.string(), character_relationship_id: z.string().optional() })
      .array()
      .optional(),
  }),
});

export const AddToCharacterSchema = z.object({
  data: z.object({
    id: z.string(),
  }),
  relations: z.object({
    documents: z.object({ id: z.string() }).array().optional(),
    images: z.object({ id: z.string() }).array().optional(),
    tags: z.object({ id: z.string() }).array().optional(),
  }),
});

export const RemoveFromCharacterSchema = z.object({
  data: z.object({
    id: z.string(),
    document: z.object({ data: z.object({ id: z.string() }) }).optional(),
    image: z.object({ data: z.object({ id: z.string() }) }).optional(),
    tag: z.object({ data: z.object({ id: z.string() }) }).optional(),
  }),
});

export type InsertCharacterType = z.infer<typeof InsertCharacterSchema>;
export type UpdateCharacterType = z.infer<typeof UpdateCharacterSchema>;
export type AddToCharacterType = z.infer<typeof AddToCharacterSchema>;
