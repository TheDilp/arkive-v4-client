import { AssetType, AvailableWikiEntityType, AvailableWikiSubEntityType } from "../../types";

export function getFirstLetters(sentence: string): string {
  const words = sentence.split(" ");
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");
}
export function getAvatarInitials(full_name: string): string {
  const names = full_name.split(" ");
  return `${names.at(0)?.charAt(0)}${names.at(1) ? names.at(1)?.charAt(0) : ""}`;
}
export function capitalizeFirstLetter(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
export function getNavbarEntityType(type: AvailableWikiEntityType | "settings") {
  if (type === "random_tables") {
    return "random tables";
  }
  if (type === "character_fields_templates") {
    return "character fields templates";
  }
  if (type === "settings") return "Project settings";
  return type;
}
export function capitalizeSentence(sentence: string): string {
  return sentence.toUpperCase();
}
export function getCharacterFullName(first_name: string, nickname?: string | null, last_name?: string | null): string {
  return `${first_name?.trim()}${nickname ? ` ${nickname?.trim()}` : ""}${last_name ? ` ${last_name?.trim()}` : ""}`;
}
export function getSentenceCase(field: string) {
  const result = field?.replaceAll("_", " ")?.replace(/([A-Z])/g, " $1") || "";
  return result.charAt(0).toUpperCase() + result.slice(1);
}
export function getSingularEntityType(type: AvailableWikiEntityType | AvailableWikiSubEntityType | AssetType) {
  if (type === "alter_names") return "alter name";
  if (type === "character_fields") return "character field";
  if (type === "character_fields_templates") return "character field template";
  if (type === "map_layers") return "map layer";
  if (type === "map_pins") return "map pin";
  if (type === "random_table_options") return "random table option";
  if (type === "random_tables") return "random table";
  if (type === "dictionaries") return "dictionary";
  return getSentenceCase(type.slice(0, type.length - 1));
}
export function getPluralEntityType(type: AvailableWikiEntityType | AvailableWikiSubEntityType | AssetType) {
  return type.replaceAll("_", " ");
}
export function validateHexCode(hex: string) {
  return /^#[0-9A-F]{6}$/i.test(hex);
}
export function getTextSizeFromHeadingLevel(level: number): string {
  if (level === 1) return "text-3xl";
  if (level === 2) return "text-2xl";
  if (level === 3) return "text-xl";
  if (level === 4) return "text-lg";
  if (level === 5) return "text-base";
  if (level === 6) return "text-sm";
  return "text-base";
}
