import z from "zod";

export const InsertRoleSchema = z.object({
  data: z.object({
    title: z.string(),
    project_id: z.string(),
    permissions: z.string().array().min(1),
  }),
});
