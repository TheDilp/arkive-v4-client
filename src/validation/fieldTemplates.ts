import { z } from "zod";

export const UpdateCharacterFieldsTemplateSchema = z
  .object({
    id: z.string().optional(),
    sort: z.number().optional(),
    title: z.string().optional(),
  })
  .strict();
