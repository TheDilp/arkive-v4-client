import { z } from "zod";

export const InsertEventGroupSchema = z.object({
  data: z.object({
    title: z.string(),
    project_id: z.string(),
  }),
});
export const UpdateEventGroupSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
  }),
});
export const ListEventGroupSchema = z.object({
  data: z.object({
    project_id: z.string(),
  }),
});
export const ReadEventGroupSchema = z.object({
  data: z.object({
    id: z.string(),
  }),
});
