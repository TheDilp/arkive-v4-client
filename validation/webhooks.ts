import { z } from "zod";

export const InsertWebhookSchema = z.object({
  data: z.object({
    title: z.string().transform((value) => value.trim()),
    url: z.string().transform((value) => value.trim()),
    user_id: z.string(),
  }),
});

export const UpdateWebhookSchema = z.object({
  data: z.object({
    title: z.string().transform((value) => value.trim()),
  }),
});
