import { z } from "zod";

export const InsertCharacterRelationshipSchema = z.object({
  data: z.object({
    title: z.string(),
    project_id: z.string(),
    ascendant_title: z.string(),
    descendant_title: z.string(),
  }),
});
