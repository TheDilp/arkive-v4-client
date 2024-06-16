import { EntityPermissionType } from "./baseEntityTypes";

export interface WordType {
  id: string;
  owner_id: string;
  title: string;
  translation: string;
  parent_id: string;
  description?: string;
  permissions: EntityPermissionType[];
}

export type WordStateType = Partial<WordType>;
