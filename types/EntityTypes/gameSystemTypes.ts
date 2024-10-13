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
type DnD5ESkillData = {
  value: number;
};
type DnD5ESkillType = Record<DnD5eSkills, DnD5ESkillData>;

type DnD5ETraitsType = {
  size: string;
};

type DnD5EDetailsType = {
  xp: {
    value: number;
  };
  bond: string;
  flaw: string;
  race: string | null;
  ideal: string;
  trait: string;
  alignment: string;
  appearance: string;
  background: string | null;
  originalClass: string;
};

type DnD5ECurrencyType = {
  cp: number;
  sp: number;
  gp: number;
  ep: number;
  pp: number;
};

type DnD5EAbilityData = { max: number | null; value: number; proficient: number };
type DnD5EAbilityType = Record<DnD5eAbilities, DnD5EAbilityData>;

type DnD5EAttributes = {
  ac: {
    flat: number | null;
  };
  hp: {
    max: number | null;
    value: number;
  };
  init: {
    bonus: string;
    ability: DnD5eAbilities;
  };
  senses: {
    units: number | null;
    special: "";
    truesight: number | null;
    blindsight: number | null;
    darkvision: number | null;
    tremorsense: number | null;
  };
  movement: {
    fly: number | null;
    swim: number | null;
    walk: number | null;
    climb: number | null;
    hover: boolean;
    units: string | null;
    burrow: number | null;
  };
};

export type DnD5ESystemType = {
  skills: DnD5ESkillType;
  traits: DnD5ETraitsType;
  details: DnD5EDetailsType;
  currency: DnD5ECurrencyType;
  abilities: DnD5EAbilityType;
  attributes: DnD5EAttributes;
};
//#endregion dnd5e
