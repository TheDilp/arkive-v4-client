import { AvailableIcons } from "../../utils";
import { PermissionType } from "./permissionsTypes";

export interface RoleType {
  id: string;
  project_id: string;
  title: string;
  icon: AvailableIcons | null;
  permissions: PermissionType[];
}
