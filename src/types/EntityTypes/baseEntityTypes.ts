export interface BaseEntityType {
  id: string;
  title: string;
  project_id: string;
  parent_id: string | null;
  parents?: { id: string; title: string; parent_id: string | null }[];
  children?: BaseEntityType[];
  is_folder: boolean | null;
  is_public: boolean | null;
  icon: string | null;
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
  | "characters"
  | "documents"
  | "maps"
  | "map_pins"
  | "boards"
  | "nodes"
  | "edges"
  | "images"
  | "tags";

export type AllAvailableEntities = AvailableEntityType | AvailableSubEntityType;
