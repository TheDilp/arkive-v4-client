import { RolePermissionCodes } from "../../utils";

export type PermissionCodeType = (typeof RolePermissionCodes)[number];

export interface PermissionType {
  id: string;
  title: string;
  code: PermissionCodeType;
  parent_category: number;
}
