import { z } from "zod";

export const InsertGatewayConfigurationSchema = z.object({
  data: z.object({
    title: z.string(),
    gateway_type: z.literal("characters").or(z.literal("blueprint_instances")),
    project_id: z.string(),
  }),
  relations: z.object({
    characters: z.string().array(),
    blueprint_instances: z.string().array(),
    documents: z.string().array(),
    maps: z.string().array(),
    map_pins: z.string().array(),
    events: z.string().array(),
    images: z.string().array(),
    random_tables: z.string().array(),
  }),
});

export const UpdateGatewayConfigurationSchema = z.object({
  data: z
    .object({
      id: z.string(),
      title: z.string().optional(),
    })
    .optional(),
  relations: z.object({
    characters: z.string().array(),
    blueprint_instances: z.string().array(),
    documents: z.string().array(),
    maps: z.string().array(),
    map_pins: z.string().array(),
    events: z.string().array(),
    images: z.string().array(),
    random_tables: z.string().array(),
  }),
});

export type InsertGatewayConfigurationType = z.infer<typeof InsertGatewayConfigurationSchema>;
export type UpdateGatewayConfigurationType = z.infer<typeof UpdateGatewayConfigurationSchema>;
// export type UpdateDocumentType = z.infer<typeof UpdateDocumentSchema>;
