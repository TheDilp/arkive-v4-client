import { EntityPermissionType } from "./baseEntityTypes";

export interface TagType {
  id: string;
  deleted_at: string;
  title: string;
  color: string;
  project_id: string;
  owner_id: string;
  permissions: EntityPermissionType[];
}
