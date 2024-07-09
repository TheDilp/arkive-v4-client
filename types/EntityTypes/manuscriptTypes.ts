import { EntityPermissionType } from "./baseEntityTypes";
import { TagType } from "./tagTypes";

export type ManuscriptType = {
  id: string;
  deleted_at: string;
  owner_id: string;
  title: string;
  project_id: string;
  tags: TagType[];
  documents: ManuscriptDocumentType[];
  permissions: EntityPermissionType[];
};

export type ManuscriptDocumentType = {
  id: string;
  title: string;
  sort: number;
  children: ManuscriptDocumentType[];
};
