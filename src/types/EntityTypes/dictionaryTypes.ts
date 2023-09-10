import { BaseEntityType } from "./baseEntityTypes";

export interface DictionaryType extends BaseEntityType {}

export type DictionaryStateType = Partial<Omit<DictionaryType, "children" | "parents">>;
