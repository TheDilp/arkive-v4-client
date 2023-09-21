import { AvailableEntityType, AvailableSubEntityType } from "../../types";
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

  return IconEnum.error;
}
export function getEntityNameFromType(type: AvailableEntityType | AvailableSubEntityType) {
  if (type === "dictionaries") return "dictionary";
  if (type === "random_tables") return "random table";
  if (type === "character_fields_templates") return "field template";
  if (type === "map_pins") return "map pin";
  return type.substring(0, type.length - 1);
}

export function getParentEntityType(type: AvailableSubEntityType): AvailableEntityType | null {
  if (type === "map_pins" || type === "map_layers") return "maps";
  if (type === "nodes" || type === "edges") return "graphs";
  if (type === "random_table_options") return "random_tables";
  if (type === "events") return "calendars";
  if (type === "words") return "dictionaries";

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
