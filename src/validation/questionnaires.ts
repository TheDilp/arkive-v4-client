import { z } from "zod";

const QuestionTypeSchema = z.union([
  z.literal("text"),
  z.literal("number"),
  z.literal("boolean"),
  z.literal("select_single"),
  z.literal("select_multiple"),
  z.literal("characters_single"),
  z.literal("characters_multiple"),
  z.literal("blueprints_single"),
  z.literal("blueprints_multiple"),
  z.literal("events_single"),
  z.literal("events_multiple"),
  z.literal("locations_single"),
  z.literal("locations_multiple"),
]);

export const InsertQuestionnaireSchema = z.object({
  data: z.object({
    title: z.string(),
    icon: z.string().optional(),
  }),
  relations: z.object({
    questions: z
      .object({
        data: z.object({
          id: z.string(),
          title: z.string(),
          sort: z.number().optional(),
          type: QuestionTypeSchema,
          options: z.object({ id: z.string(), value: z.string() }).array().optional(),
          blueprint_id: z.string().optional().nullable(),
        }),
      })
      .array()
      .min(1),
  }),
});

export const UpdateQuestionnaireSchema = z
  .object({
    data: z.object({
      id: z.string(),
      title: z.string().optional(),
      icon: z.string().optional().nullable(),
    }),
    relations: z
      .object({
        questions: z
          .object({
            data: z.object({
              id: z.string(),
              title: z.string(),
              sort: z.number().optional(),
              type: QuestionTypeSchema,
              options: z.object({ id: z.string(), value: z.string() }).array().optional(),
              blueprint_id: z.string().optional().nullable(),
            }),
          })
          .array()
          .min(1)
          .optional(),
      })
      .optional(),
  })
  .strict();
