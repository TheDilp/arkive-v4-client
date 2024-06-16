type NotificationAction = "create" | "update" | "arkive" | "delete";

type NotificationEntitiesType =
  | "characters"
  | "blueprints"
  | "blueprint_instances"
  | "documents"
  | "maps"
  | "map_pins"
  | "graphs"
  | "nodes"
  | "edges"
  | "calendars"
  | "events"
  | "dictionaries"
  | "words"
  | "tags"
  | "character_fields_templates"
  | "images"
  | "random_tables"
  | "random_table_options";

export interface NotificationEntityType {
  id: string;
  created_at: string;
  title: string;
  parent_id: string | null;
  user_id: string;
  user_name: string;
  user_image: string | null;
  image_id: string | null;
  action: NotificationAction;
  project_id: string;
  entity_type: NotificationEntitiesType;
  related_id: string;
}
