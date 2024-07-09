import { z } from "zod";

import { InsertEntityPermissionSchema, UpdateEntityPermissionSchema } from "../permissions";
import { InsertMapLayerSchema, UpdateMapLayerSchema } from "./map_layers";

export const InsertMapSchema = z.object({
  data: z.object({
    title: z.string().transform((value) => value.trim()),
    is_folder: z.boolean().nullable().optional(),
    is_public: z.boolean().nullable().optional(),
    cluster_pins: z.boolean().nullable().optional(),
    icon: z.string().nullable().optional(),
    project_id: z.string(),
    parent_id: z.string().nullable().optional(),
    image_id: z.string(),
  }),
  relations: z
    .object({
      tags: z.object({ id: z.string() }).array().optional(),
      map_layers: z
        .object({
          data: z.object({
            title: z.string().transform((value) => value.trim()),
            is_public: z.boolean().nullable().optional(),
            image_id: z.string(),
          }),
        })
        .array()
        .optional(),
    })
    .optional(),
  permissions: InsertEntityPermissionSchema,
});

export const UpdateMapSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    is_folder: z.boolean().nullable().optional(),
    is_public: z.boolean().nullable().optional(),
    cluster_pins: z.boolean().nullable().optional(),
    icon: z.string().nullable().optional(),
    parent_id: z.string().nullable().optional(),
    owner_id: z.string().optional(),
    image_id: z.string().optional(),
  }),
  relations: z
    .object({
      tags: z.object({ id: z.string() }).array().optional(),
      map_layers: InsertMapLayerSchema.array().or(UpdateMapLayerSchema.array()).optional(),
    })
    .optional(),
  permissions: UpdateEntityPermissionSchema,
});

export type InsertMapType = z.infer<typeof InsertMapSchema>;
export type UpdateMapType = z.infer<typeof UpdateMapSchema>;
