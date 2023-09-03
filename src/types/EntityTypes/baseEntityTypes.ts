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
  | "project"
  | "characters"
  | "documents"
  | "maps"
  | "graphs"
  | "screens"
  | "dictionaries"
  | "calendars"
  | "timelines"
  | "random_tables"
  | "character_fields_templates"
  | "generators"
  | "tags";
export type AvailableSubEntityType =
  | "alter_names"
  | "map_pins"
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
  | "characters"
  | "documents"
  | "maps"
  | "map_pins"
  | "boards"
  | "nodes"
  | "edges"
  | "random_tables"
  | "events"
  | "images"
  | "tags";

export type SearchableMentionEntities = "characters" | "documents" | "maps" | "map_pins" | "boards" | "nodes" | "words";

export type AllAvailableEntities = AvailableEntityType | AvailableSubEntityType;
