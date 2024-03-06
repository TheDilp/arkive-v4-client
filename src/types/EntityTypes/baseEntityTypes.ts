import { AvailableIcons } from "../../utils";

export interface BaseEntityType {
  id: string;
  title: string;
  project_id: string;
  parent_id?: string | null;
  parents?: { id: string; title: string; is_folder: boolean; parent_id: string | null }[];
  children?: (BaseEntityType & { image_id?: string })[];
  is_folder?: boolean | null;
  is_public?: boolean | null;
  icon?: AvailableIcons | null;
}
export type AvailableEntityType =
  | "projects"
  | "characters"
  | "documents"
  | "maps"
  | "map_pin_types"
  | "graphs"
  | "screens"
  | "dictionaries"
  | "blueprints"
  | "calendars"
  | "timelines"
  | "random_tables"
  | "character_fields_templates"
  | "generators"
  | "character_relationship_types"
  | "tags"
  | "conversations"
  | "webhooks"
  | "images"
  | "roles"
  | "permissions";

export type AvailableSubEntityType =
  | "alter_names"
  | "map_pins"
  | "character_map_pins"
  | "map_layers"
  | "nodes"
  | "edges"
  | "sections"
  | "cards"
  | "words"
  | "months"
  | "events"
  | "random_table_options"
  | "character_fields"
  | "blueprint_instances"
  | "messages";

export type SearchableEntities =
  | "all"
  | "by_tags"
  | "characters"
  | "documents"
  | "documents_content"
  | "alter_names"
  | "maps"
  | "character_map_pins"
  | "map_pins"
  | "graphs"
  | "blueprints"
  | "blueprint_instances"
  | "nodes"
  | "edges"
  | "random_tables"
  | "events"
  | "images"
  | "calendars"
  | "map_images"
  | "dictionaries"
  | "words"
  | "tags"
  | "places";

export type SearchableMentionEntities =
  | "characters"
  | "blueprint_instances"
  | "documents"
  | "maps"
  | "map_pins"
  | "graphs"
  | "nodes"
  | "words";

export type EntitiesWithFolders = "documents" | "maps" | "graphs" | "dictionaries" | "calendars" | "random_tables";

export type AllAvailableEntities = AvailableEntityType | AvailableSubEntityType;
