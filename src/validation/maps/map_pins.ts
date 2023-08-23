import { z } from "zod";

export const InsertMapPinSchema = z.object({
  data: z.object({
    parent_id: z.string(),
    lat: z.number(),
    lng: z.number(),
    text: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    border_color: z.string().nullable().optional(),
    background_color: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    show_background: z.boolean().optional(),
    show_border: z.boolean().optional(),
    is_public: z.boolean().nullable().optional(),
    map_link: z.string().nullable().optional(),
    doc_id: z.string().nullable().optional(),
    image_id: z.string().nullable().optional(),
  }),
});
export const UpdateMapPinSchema = z.object({
  data: z.object({
    id: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    text: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    border_color: z.string().nullable().optional(),
    background_color: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    show_background: z.boolean().optional(),
    show_border: z.boolean().optional(),
    is_public: z.boolean().nullable().optional(),
    map_link: z.string().nullable().optional(),
    doc_id: z.string().nullable().optional(),
    image_id: z.string().nullable().optional(),
  }),
});

export type InsertMapPinType = z.infer<typeof InsertMapPinSchema>;
export type UpdateMapPinType = z.infer<typeof UpdateMapPinSchema>;
