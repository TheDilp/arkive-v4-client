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

export type SearchableEntities = "characters" | "documents" | "maps" | "map_pins" | "boards" | "nodes" | "edges" | "images";

export type AllAvailableEntities = AvailableEntityType | AvailableSubEntityType;
