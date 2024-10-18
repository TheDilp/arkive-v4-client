export interface GameSystemType {
  id: string;
  title: string;
  code: string;
  configuration: any;
}

//#region dnd5e
export type DnD5eAbilities = "str" | "dex" | "con" | "int" | "wis" | "cha";
export type DnD5eSkills =
  | "acr"
  | "ani"
  | "arc"
  | "ath"
  | "dec"
  | "his"
  | "ins"
  | "inv"
  | "itm"
  | "med"
  | "nat"
  | "per"
  | "prc"
  | "prf"
  | "rel"
  | "slt"
  | "ste"
  | "sur";
type DnD5ESkillDataType = {
  value: 0 | 1;
  ability: DnD5eAbilities;
};
type DnD5EItemTypes =
  | "class"
  | "subclass"
  | "race"
  | "background"
  | "spell"
  | "feat"
  | "weapon"
  | "equipment"
  | "container"
  | "consumable"
  | "loot"
  | "tool";
type DnD5EItemType = {
  id: string;
  name: string;
  type: DnD5EItemTypes;
  level?: number;
  is_prepared?: boolean;
  equipped?: boolean;
  quantity?: number;
};
type DnD5EDetailsType = {
  bond: string;
  flaw: string;
  ideal: string;
  trait: string;
  alignment: string;
  hair: string;
  weight: string;
  height: string;
  eyes: string;
  faith: string;
  gender: string;
  skin: string;
  languages: string[];
  custom_languages: string;
  appearance: string;
  xp: {
    value: number;
  };
};
type DnD5ECurrencyType = {
  cp: number;
  sp: number;
  gp: number;
  ep: number;
  pp: number;
};
type DnD5eAbilitiesDataType = {
  value: number;
  proficient: 0 | 1;
};
type DnD5EAbilitiesType = Record<DnD5eAbilities, DnD5eAbilitiesDataType>;
type DnD5ESpellsType = {
  pact: { value: number; override: null | number };
  spells1: { value: number; override: null | number };
  spells2: { value: number; override: null | number };
  spells3: { value: number; override: null | number };
  spells4: { value: number; override: null | number };
  spells5: { value: number; override: null | number };
  spells6: { value: number; override: null | number };
  spells7: { value: number; override: null | number };
  spells8: { value: number; override: null | number };
  spells9: { value: number; override: null | number };
};
export type DnD5ESystemDataType = {
  abilities: DnD5EAbilitiesType;
  details: DnD5EDetailsType;
  items: DnD5EItemType[];
  skills: Record<DnD5eSkills, DnD5ESkillDataType>;
  currency: DnD5ECurrencyType;
  spells: DnD5ESpellsType;
};

// Define caster types
export type CasterType = "full" | "half" | "third" | "pact";
//#endregion dnd5e
