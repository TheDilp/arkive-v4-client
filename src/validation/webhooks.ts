import { z } from "zod";

export const InsertWebhookSchema = z.object({
  data: z.object({
    title: z.string(),
    url: z.string(),
    user_id: z.string(),
  }),
});
