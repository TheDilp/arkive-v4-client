import { DnD5eAbilities, DnD5eSkills } from "../../types";

export const DnD5ESkillsEnum: Record<
  Exclude<DnD5eAbilities, "con">,
  { label: string; code: DnD5eSkills; ability: DnD5eAbilities }[]
> = {
  str: [{ label: "Athletics", code: "ath", ability: "str" }],
  dex: [
    { label: "Acrobatics", code: "acr", ability: "dex" },
    { label: "Sleight of Hand", code: "slt", ability: "dex" },
    { label: "Stealth", code: "ste", ability: "dex" },
  ],
  int: [
    { label: "Arcana", code: "arc", ability: "int" },
    { label: "History", code: "his", ability: "int" },
    { label: "Investigation", code: "inv", ability: "int" },
    { label: "Nature", code: "nat", ability: "int" },
    { label: "Religion", code: "rel", ability: "int" },
  ],
  wis: [
    { label: "Animal Handling", code: "ani", ability: "wis" },
    { label: "Insight", code: "ins", ability: "wis" },
    { label: "Medicine", code: "med", ability: "wis" },
    { label: "Perception", code: "per", ability: "wis" },
    { label: "Survival", code: "sur", ability: "wis" },
  ],
  cha: [
    { label: "Deception", code: "dec", ability: "cha" },
    { label: "Intimidation", code: "itm", ability: "cha" },
    { label: "Performance", code: "prf", ability: "cha" },
    { label: "Persuasion", code: "per", ability: "cha" },
  ],
};
