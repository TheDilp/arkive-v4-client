import { z } from "zod";

const ArrowShapeEnum = z.enum([
  "none",
  "triangle",
  "triangle-tee",
  "triangle-backcurve",
  "circle-triangle",
  "vee",
  "tee",
  "circle",
  "diamond",
  "chevron",
]);

const ArrowFillEnum = z.enum(["filled", "hollow"]);

const InsertEdgeSchema = z.object({
  data: z.object({
    id: z.string(),
    parent_id: z.string(),
    label: z
      .string()
      .transform((value) => value.trim())
      .nullable()
      .optional(),
    curve_style: z.string().nullable().optional(),
    line_style: z.string().nullable().optional(),
    line_color: z.string().nullable().optional(),
    line_fill: z.string().nullable().optional(),
    line_opacity: z.number().nullable().optional(),
    width: z.number().nullable().optional(),
    control_point_distances: z.number().nullable().optional(),
    control_point_weights: z.number().nullable().optional(),
    taxi_direction: z.string().nullable().optional(),
    taxi_turn: z.number().nullable().optional(),
    arrow_scale: z.number().nullable().optional(),

    target_arrow_shape: ArrowShapeEnum.nullable().optional(),
    target_arrow_fill: ArrowFillEnum.nullable().optional(),
    target_arrow_color: z.string().nullable().optional(),
    source_arrow_shape: ArrowShapeEnum.nullable().optional(),
    source_arrow_fill: ArrowFillEnum.nullable().optional(),
    source_arrow_color: z.string().nullable().optional(),
    mid_target_arrow_shape: ArrowShapeEnum.nullable().optional(),
    mid_target_arrlow_fill: z.string().nullable().optional(),
    mid_target_arrlow_color: z.string().nullable().optional(),
    mid_source_arrow_shape: ArrowShapeEnum.nullable().optional(),
    mid_source_arrow_fill: ArrowFillEnum.nullable().optional(),
    mid_source_arrow_color: z.string().nullable().optional(),

    font_size: z.number().nullable().optional(),
    font_color: z
      .string()
      .transform((value) => value.trim())
      .nullable()
      .optional(),
    font_family: z.string().nullable().optional(),
    z_index: z.number().nullable().optional(),
  }),
  relations: z
    .object({
      tags: z.object({ id: z.string() }).array().optional(),
    })
    .optional(),
});

export const UpdateEdgeSchema = z.object({
  data: z.object({
    id: z.string(),
    label: z
      .string()
      .transform((value) => value.trim())
      .nullable()
      .optional(),
    curve_style: z.string().nullable().optional(),
    line_style: z.string().nullable().optional(),
    line_color: z.string().nullable().optional(),
    line_fill: z.string().nullable().optional(),
    line_opacity: z.number().nullable().optional(),
    width: z.number().nullable().optional(),
    control_point_distances: z.number().nullable().optional(),
    control_point_weights: z.number().nullable().optional(),
    taxi_direction: z.string().nullable().optional(),
    taxi_turn: z.number().nullable().optional(),
    arrow_scale: z.number().nullable().optional(),
    target_arrow_shape: ArrowShapeEnum.nullable().optional(),
    target_arrow_fill: ArrowFillEnum.nullable().optional(),
    target_arrow_color: z.string().nullable().optional(),
    source_arrow_shape: ArrowShapeEnum.nullable().optional(),
    source_arrow_fill: ArrowFillEnum.nullable().optional(),
    source_arrow_color: z.string().nullable().optional(),
    mid_target_arrow_shape: ArrowShapeEnum.nullable().optional(),
    mid_target_arrlow_fill: z.string().nullable().optional(),
    mid_target_arrlow_color: z.string().nullable().optional(),
    mid_source_arrow_shape: ArrowShapeEnum.nullable().optional(),
    mid_source_arrow_fill: ArrowFillEnum.nullable().optional(),
    mid_source_arrow_color: z.string().nullable().optional(),
    font_size: z.number().nullable().optional(),
    font_color: z
      .string()
      .transform((value) => value.trim())
      .nullable()
      .optional(),
    font_family: z.string().nullable().optional(),
    z_index: z.number().nullable().optional(),
  }),
  relations: z
    .object({
      tags: z.object({ id: z.string() }).array().optional(),
    })
    .optional(),
});

export type InsertEdgeType = z.infer<typeof InsertEdgeSchema>;
