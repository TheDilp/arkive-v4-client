import { z } from "zod";

export const InsertTimelineSchema = z.object({
  data: z.object({
    title: z.string(),
    is_folder: z.boolean().nullable().optional(),
    is_public: z.boolean().nullable().optional(),
    icon: z.string().nullable().optional(),
    project_id: z.string(),
    parent_id: z.string().nullable().optional(),
  }),
  relations: z.object({
    calendars: z.object({ id: z.string() }).array(),
  }),
});

export const UpdateTimelineSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
    is_folder: z.boolean().nullable().optional(),
    is_public: z.boolean().nullable().optional(),
    icon: z.string().nullable().optional(),
    parent_id: z.string().nullable().optional(),
  }),
  relations: z.object({
    calendars: z.object({ id: z.string() }).array(),
  }),
});
