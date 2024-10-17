import { CasterType, DnD5eAbilities } from "../../types";

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
const DnD5EXPThresholds = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000,
  305000, 355000,
];

export function getDnD5ECharacterLevelData(xp: number): {
  level: number;
  previous: number;
  next: number;
  proficiency_bonus: number;
} {
  if (xp < 300) {
    return { level: 1, previous: 0, next: 300, proficiency_bonus: 2 };
  }
  for (let level = DnD5EXPThresholds.length; level > 0; level--) {
    if (xp >= DnD5EXPThresholds[level - 1]) {
      return {
        level,
        previous: DnD5EXPThresholds[level - 1],
        next: DnD5EXPThresholds[level],
        proficiency_bonus: Math.floor((level - 1) / 4) + 2,
      };
    }
  }
  return { level: 1, previous: 0, next: 300, proficiency_bonus: 2 };
}

export function getCasterType(character_class: string): CasterType | null {
  if (["wizard", "cleric", "druid", "sorcerer", "bard"].includes(character_class)) return "full";
  if (["paladin", "ranger"].includes(character_class)) return "half";
  if (["rogue", "fighter"].includes(character_class)) return "third";
  if (["warlock"].includes(character_class)) return "pact";
  return null;
}

// Spell slots for Full Casters (Wizard, Cleric, etc.)
const fullCasterSlots = [
  [2],
  [3],
  [4, 2],
  [4, 3],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

// Spell slots for Half Casters (Paladin, Ranger)
const halfCasterSlots = [
  [],
  [2],
  [3],
  [3],
  [4, 2],
  [4, 2],
  [4, 3],
  [4, 3],
  [4, 3, 2],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 2],
  [4, 3, 3, 3],
  [4, 3, 3, 3],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 1],
];

// Spell slots for Third Casters (Rogue - Arcane Trickster,Fighter - Eldritch Knight)
const thirdCasterSlots = [
  [],
  [],
  [2],
  [3],
  [3],
  [3],
  [4, 2],
  [4, 2],
  [4, 2],
  [4, 3],
  [4, 3],
  [4, 3],
  [4, 3, 2],
  [4, 3, 2],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 1],
];
// Spell slots for Warlocks
const pactCasterSlots = [[1], [2], [2], [2], [2], [2], [2], [2], [2], [2], [3], [3], [3], [3], [3], [3], [3], [3], [4], [4]];

export function getSpellSlots(character_class: string, level: number): number[] {
  const casterType = getCasterType(character_class);
  if (!casterType) return [];
  // Map caster type to correct slot table
  switch (casterType) {
    case "full":
      return fullCasterSlots[level - 1] || [];
    case "half":
      return halfCasterSlots[level - 1] || [];
    case "third":
      return thirdCasterSlots[level - 1] || [];
    case "pact":
      return pactCasterSlots[level - 1] || [];
    default:
      return [];
  }
}
