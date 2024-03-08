import { RolePermissionCodes } from "../../utils";

export type PermissionCodeType = (typeof RolePermissionCodes)[keyof typeof RolePermissionCodes];

export interface PermissionType {
  id: string;
  title: string;
  code: PermissionCodeType;
}
