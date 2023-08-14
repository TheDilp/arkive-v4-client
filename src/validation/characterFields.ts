import { z } from "zod";

export const UpdateCharacterFieldsSchema = z.object({
  id: z.string(),
  title: z.string(),
  project_id: z.string(),
  sort: z.number().optional(),
  field_type: z.string().optional(),
  parent_id: z.string().optional(),
  options: z.string().array().optional(),
  formula: z.string().nullable().optional(),
  random_table_id: z.string().nullable().optional(),
});
