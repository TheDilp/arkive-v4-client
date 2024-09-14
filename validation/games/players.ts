import { z } from "zod";

export const InsertPlayerSchema = z.object({
  data: z.object({
    nickname: z.string(),
    password: z.string(),
    game_id: z.string(),
  }),
});

export type InsertPlayerType = z.infer<typeof InsertPlayerSchema>;

export const UpdatePlayerSchema = z.object({
  data: z.object({
    nickname: z.string(),
  }),
});

export type UpdatePlayerType = z.infer<typeof UpdatePlayerSchema>;
