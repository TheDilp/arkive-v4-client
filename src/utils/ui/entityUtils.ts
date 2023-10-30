import { AvailableEntityType, AvailableSubEntityType, BlueprintFieldTypes } from "../../types";
import { IconEnum } from "..";

export function getDefaultEntityIcon(type: AvailableEntityType | AvailableSubEntityType) {
  if (type === "characters") return IconEnum.character;
  if (type === "documents") return IconEnum.document;
  if (type === "maps") return IconEnum.map;
  if (type === "graphs") return IconEnum.board;
  if (type === "calendars") return IconEnum.calendar;
  if (type === "timelines") return IconEnum.timeline;
  if (type === "dictionaries") return IconEnum.dictionary;
  if (type === "nodes") return IconEnum.node;
  if (type === "edges") return IconEnum.edge;
  if (type === "random_tables") return IconEnum.random_table;
  if (type === "character_fields_templates") return IconEnum.additional_fields;
  if (type === "events") return IconEnum.event;
  if (type === "blueprints" || type === "blueprint_instances") return IconEnum.blueprint;

  return IconEnum.error;
}
export function getEntityNameFromType(type: AvailableEntityType | AvailableSubEntityType) {
  if (type === "dictionaries") return "dictionary";
  if (type === "random_tables") return "random table";
  if (type === "character_fields_templates") return "field template";
  if (type === "map_pins") return "map pin";
  if (type === "character_relationship_types") return "character relationship type";
  return type.substring(0, type.length - 1);
}

export function getParentEntityType(type: AvailableSubEntityType): AvailableEntityType | null {
  if (type === "map_pins" || type === "map_layers") return "maps";
  if (type === "nodes" || type === "edges") return "graphs";
  if (type === "random_table_options") return "random_tables";
  if (type === "events") return "calendars";
  if (type === "words") return "dictionaries";
  if (type === "messages") return "conversations";
  if (type === "blueprint_instances") return "blueprints";

  return null;
}

export function getEntityLinkType(type: AvailableEntityType | AvailableSubEntityType) {
  if (
    type === "nodes" ||
    type === "edges" ||
    type === "random_table_options" ||
    type === "map_pins" ||
    type === "map_layers" ||
    type === "events" ||
    type === "words"
  )
    return getParentEntityType(type);

  return type;
}

export function getEntityFields(type: AvailableEntityType): string[] {
  const fields: string[] = ["id", "title", "icon", "is_folder", "parent_id"];
  if ((type === "documents" || type === "maps") && !fields.includes("image_id")) fields.push("image_id");
  if (
    (type === "graphs" || type === "random_tables" || type === "calendars" || type === "dictionaries") &&
    fields.includes("image_id")
  )
    fields.pop();

  return fields;
}

export function getSearchFieldTypeLabel(type: string) {
  if (type === "images_single") return "Image";
  if (type === "images_multiple") return "Images";
  if (type === "documents_single") return "Document";
  if (type === "documents_multiple") return "Documents";
  if (type === "locations_single") return "Location";
  if (type === "locations_multiple") return "Locations";
  return "";
}
export function getSearchFieldTypeSearchType(type: string) {
  if (type === "images_single") return "images";
  if (type === "images_multiple") return "images";
  if (type === "documents_single") return "documents";
  if (type === "documents_multiple") return "documents";
  if (type === "locations_single") return "map_pins";
  if (type === "locations_multiple") return "map_pins";
  return "";
}
export function getSearchFieldTypeLinkType(type: string) {
  if (type === "images_single") return "images";
  if (type === "images_multiple") return "images";
  if (type === "documents_single") return "documents";
  if (type === "documents_multiple") return "documents";
  if (type === "locations_single") return "maps";
  if (type === "locations_multiple") return "maps";
  return "";
}

export function getBlueprintInstanceColumnWidth(type: BlueprintFieldTypes): { minSize: number; maxSize?: number } {
  if (type === "text") return { minSize: 10, maxSize: 25 };
  if (type === "images_single" || type === "characters_single" || type === "number") return { minSize: 7.5, maxSize: 7.5 };
  if (type === "characters_multiple" || type === "select" || type === "dice_roll" || type === "random_table")
    return { minSize: 10, maxSize: 15 };
  if (type === "boolean") return { minSize: 2.75, maxSize: 2.75 };
  if (type === "select_multiple") return { minSize: 10, maxSize: 35 };
  return { minSize: 10, maxSize: 10 };
}
