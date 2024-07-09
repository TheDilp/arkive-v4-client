import { z } from "zod";

export const InsertMapPinTypeSchema = z.object({
  data: z.object({
    title: z.string().transform((value) => value.trim()),
    project_id: z.string(),
    default_icon: z.string().optional().nullable(),
    default_icon_color: z.string().optional().nullable(),
  }),
});

export const UpdateMapPinTypeSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().transform((value) => value.trim()),
    default_icon: z.string().optional().nullable(),
    default_icon_color: z.string().optional().nullable(),
  }),
});
