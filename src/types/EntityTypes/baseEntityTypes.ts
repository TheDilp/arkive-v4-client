export interface BaseEntityType {
  id: string;
  title: string;
  project_id: string;
  parent_id?: string | null;
  parents?: { id: string; title: string; parent_id: string | null }[];
  children?: (BaseEntityType & { image_id?: string })[];
  is_folder?: boolean | null;
  is_public?: boolean | null;
  icon?: string | null;
}
export type AvailableEntityType =
  | "projects"
  | "characters"
  | "documents"
  | "maps"
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
  | "tags";
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
  | "character_fields";

export type SearchableEntities =
  | "all"
  | "by_tags"
  | "characters"
  | "documents"
  | "alter_names"
  | "maps"
  | "character_map_pins"
  | "map_pins"
  | "boards"
  | "nodes"
  | "edges"
  | "random_tables"
  | "events"
  | "images"
  | "calendars"
  | "map_images"
  | "words"
  | "tags";

export type SearchableMentionEntities = "characters" | "documents" | "maps" | "map_pins" | "boards" | "nodes" | "words";

export type AllAvailableEntities = AvailableEntityType | AvailableSubEntityType;
