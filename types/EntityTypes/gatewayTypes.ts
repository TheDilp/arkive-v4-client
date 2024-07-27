export type GatewayEntityType = "characters" | "blueprint_instances";

export interface GatewayConfigType {
  id: string;
  title: string;
  gateway_type: GatewayEntityType;
  characters: string[];
  blueprint_instances: string[];
  documents: string[];
  maps: string[];
  map_pins: string[];
  events: string[];
  images: string[];
}
