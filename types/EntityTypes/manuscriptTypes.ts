import { EntityPermissionType } from "./baseEntityTypes";
import { TagType } from "./tagTypes";

export type ManuscriptType = {
  id: string;
  deleted_at: string;
  owner_id: string;
  title: string;
  project_id: string;
  tags: TagType[];
  documents: { id: string; doc_id: string; parent_id: string; sort: number };
  permissions: EntityPermissionType[];
};
