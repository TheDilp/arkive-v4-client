import { AvailableEntityType, AvailableSubEntityType } from "../../types";

export function getFirstLetters(sentence: string): string {
  const words = sentence.split(" ");
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");
}
export function getAvatarInitials(first_name: string, last_name?: string): string {
  return `${first_name.charAt(0)}${last_name ? last_name.charAt(0) : ""}`;
}
export function capitalizeFirstLetter(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function getNavbarEntityType(type: AvailableEntityType) {
  if (type === "random_tables") {
    return "random tables";
  }
  if (type === "character_fields_templates") {
    return "character fields templates";
  }
  return type;
}

export function capitalizeSentence(sentence: string): string {
  return sentence.toUpperCase();
}

export function getCharacterFullName(first_name: string, nickname?: string | null, last_name?: string | null): string {
  return `${first_name?.trim()}${nickname ? ` ${nickname?.trim()}` : ""}${last_name ? ` ${last_name?.trim()}` : ""}`;
}

export function getSentenceCase(field: string) {
  const result = field.replaceAll("_", " ").replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function getSingularEntityType(type: AvailableEntityType | AvailableSubEntityType) {
  if (type === "alter_names") return "alter name";
  if (type === "character_fields") return "character field";
  if (type === "character_fields_templates") return "character field template";
  if (type === "map_layers") return "map layer";
  if (type === "map_pins") return "map pin";
  if (type === "random_table_options") return "random table option";
  if (type === "random_tables") return "random table";
  if (type === "dictionaries") return "dictionary";
  return type.slice(0, type.length - 1);
}

export function validateHexCode(hex: string) {
  return /^#[0-9A-F]{6}$/i.test(hex);
}
