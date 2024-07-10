import { z } from "zod";

const BaseManuscriptDocumentSchema = z.object({ id: z.string(), title: z.string(), sort: z.number() });

type ManuscriptDocument = z.infer<typeof BaseManuscriptDocumentSchema> & {
  children: ManuscriptDocument[];
};

const ManuscriptDocumentSchema: z.ZodType<ManuscriptDocument> = BaseManuscriptDocumentSchema.extend({
  children: z.lazy(() => ManuscriptDocumentSchema.array()),
});

export const InsertManuscriptSchema = z.object({
  data: z.object({
    title: z.string().transform((value) => value.trim()),
    project_id: z.string(),
  }),
  relations: z.object({
    tags: z.object({ id: z.string() }).array().optional(),
    documents: ManuscriptDocumentSchema.array().min(1),
  }),
});

export type InsertManuscriptType = z.infer<typeof InsertManuscriptSchema>;
