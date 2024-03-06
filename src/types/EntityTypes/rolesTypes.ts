import { PermissionType } from "./permissionsTypes";

export interface RoleType {
  id: string;
  title: string;
  project_id: string;
  permissions: PermissionType[];
}
