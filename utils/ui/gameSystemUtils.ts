import { DnD5eAbilities } from "../../types";

export function getDnD5EAbilityModifier(score: number) {
  return Math.floor((score - 10) / 2);
}
export function getDnD5EAbilityTitleFromCode(code: DnD5eAbilities) {
  if (code === "str") return "Strength";
  if (code === "dex") return "Dexterity";
  if (code === "con") return "Constitution";
  if (code === "int") return "Intelligence";
  if (code === "wis") return "Wisdom";
  if (code === "cha") return "Charisma";
  return "";
}
