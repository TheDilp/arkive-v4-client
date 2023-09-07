import { AvailableEntityType, AvailableSubEntityType } from "../../types";
import { IconEnum } from "..";

export function getDefaultEntityIcon(type: AvailableEntityType) {
  if (type === "characters") return IconEnum.character;
  if (type === "documents") return IconEnum.document;
  if (type === "maps") return IconEnum.map;
  if (type === "graphs") return IconEnum.board;
  if (type === "calendars") return IconEnum.calendar;
  if (type === "timelines") return IconEnum.timeline;
  if (type === "random_tables") return IconEnum.random_table;
  if (type === "character_fields_templates") return IconEnum.additional_fields;
  return IconEnum.error;
}
export function getEntityNameFromType(type: AvailableEntityType | AvailableSubEntityType) {
  if (type === "dictionaries") return "dictionary";
  if (type === "random_tables") return "random table";
  if (type === "character_fields_templates") return "field template";
  if (type === "map_pins") return "map pin";
  return type.substring(0, type.length - 1);
}
