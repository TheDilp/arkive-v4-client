import { z } from "zod";

export const MessageTypeSchema = z.enum(["character", "narration", "place"]);

export const InsertMessageSchema = z.object({
  data: z.object({
    content: z.object({}),
    parent_id: z.string(),
    sender_id: z.string().optional(),
    type: MessageTypeSchema,
  }),
});

export type InsertMessageType = z.infer<typeof InsertMessageSchema>;
