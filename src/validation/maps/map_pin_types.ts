import { z } from "zod";

export const InsertMapPinTypeSchema = z.object({
  data: z.object({
    title: z.string(),
    project_id: z.string(),
  }),
});

export const UpdateMapPinTypeSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string(),
  }),
});
