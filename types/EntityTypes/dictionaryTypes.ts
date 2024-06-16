import { BaseEntityType } from "./baseEntityTypes";
import { WordType } from "./wordTypes";

export interface DictionaryType extends BaseEntityType {
  words: WordType[];
}

export type DictionaryStateType = Partial<Omit<DictionaryType, "children" | "parents">>;
