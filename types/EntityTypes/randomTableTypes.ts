import { AvailableIcons } from "../../utils";
import { BaseEntityType } from "./baseEntityTypes";

type OptionEntityType =
  | "text"
  | "characters"
  | "blueprint_instances"
  | "documents"
  | "maps"
  | "map_pins"
  | "graphs"
  | "events"
  | "words"
  | "images";

export interface RandomTableOptionType {
  id: string;
  title: string;
  description?: string | null;
  parent_id: string;
  character_id: string | null;
  blueprint_instance_id: string | null;
  document_id: string | null;
  map_id: string | null;
  map_pin_id: string | null;
  graph_id: string | null;
  event_id: string | null;
  word_id: string | null;
  image_id: string | null;
  related_data: {
    id: string;
    title: string;
    icon: AvailableIcons | undefined | null;
    image_id: string | undefined | null;
    type: OptionEntityType;
  } | null;
}

export interface RandomTableType extends BaseEntityType {
  description?: string | null;
  random_table_options: RandomTableOptionType[];
}
