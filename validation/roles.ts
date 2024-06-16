import { z } from "zod";

export const InsertRoleSchema = z.object({
  data: z.object({
    title: z.string(),
    project_id: z.string(),
    icon: z.string(),
    permissions: z.string().array().min(1),
  }),
});

export const UpdateRoleSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string(),
    icon: z.string(),
    permissions: z.string().array().min(1),
  }),
});
