import { z } from "zod";

export const InsertCharacterFieldsSchema = z.object({
  title: z.string(),
  sort: z.number().optional(),
  field_type: z.string().optional(),
  parent_id: z.string().optional(),
  options: z.string().array().optional(),
  formula: z.string().nullable().optional(),
  random_table_id: z.string().nullable().optional(),
});
export const UpdateCharacterFieldsSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  sort: z.number().optional(),
  field_type: z.string().optional(),
  parent_id: z.string().optional(),
  options: z.string().array().optional(),
  formula: z.string().nullable().optional(),
  random_table_id: z.string().nullable().optional(),
});
