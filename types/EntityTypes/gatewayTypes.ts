import { AvailableIcons } from "../../utils";

export type GatewayEntityType = "characters" | "blueprint_instances";

export interface GatewayConfigType {
  id: string;
  title: string;
  gateway_type: GatewayEntityType;
  characters: { related_id: string }[];
  blueprint_instances: { related_id: string }[];
  documents: { related_id: string }[];
  maps: { related_id: string }[];
  map_pins: { related_id: string }[];
  events: { related_id: string }[];
  images: { related_id: string }[];
  random_tables: { related_id: string }[];
  tags: { related_id: string }[];
}

export interface GatewayConfigOptionType {
  value: string;
  label: string;
  parent_id: string | null;
  image: string | null;
  icon: AvailableIcons | undefined;
  project_id: string;
  entity_type:
    | "characters"
    | "blueprint_instances"
    | "documents"
    | "maps"
    | "map_pins"
    | "events"
    | "images"
    | "random_tables"
    | "tags";
}
