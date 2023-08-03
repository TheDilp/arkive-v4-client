import { AvailableEntityType } from "../../types";
import { IconEnum } from "..";

export function getDefaultEntityIcon(type: AvailableEntityType) {
  if (type === "characters") return IconEnum.character;
  if (type === "documents") return IconEnum.document;
  if (type === "maps") return IconEnum.map;
  if (type === "graphs") return IconEnum.board;
  return IconEnum.error;
}
export function getEntityNameFromType(type: AvailableEntityType) {
  if (type === "dictionaries") return "dictionary";
  if (type === "character_fields_templates") return "Field template";
  return type.substring(0, type.length - 1);
}
