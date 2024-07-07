import { EntityPermissionType } from "./baseEntityTypes";

export interface WordType {
  id: string;
  deleted_at: string;
  owner_id: string;
  title: string;
  translation: string;
  parent_id: string;
  description?: string;
  permissions: EntityPermissionType[];
  is_public: boolean | null;
}

export type WordStateType = Partial<WordType>;

