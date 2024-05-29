import { SearchableMentionEntities } from "./baseEntityTypes";

export type MatchType = SearchableMentionEntities | "random_tables" | "dice_roll" | "derived" | "custom";
export type DocumentTemplateFieldType = {
  id: string;
  key: string;
  entity_type: MatchType | null;
  parent_id: string;
  value: string;
  formula: string | null;
  derive_from: string | null;
  derive_formula: string | null;
  is_randomized: boolean | null;
};
export interface DocumentTemplateType {
  id: string;
  deleted_at?: string | null;
  owner_id: string;
  project_id: string;
  title: string;
  fields: DocumentTemplateFieldType[];
}
