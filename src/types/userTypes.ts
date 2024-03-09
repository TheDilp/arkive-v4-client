import { PermissionCodeType, PermissionType, ProjectType, RoleType, WebhookType } from "./EntityTypes";

export interface UserType {
  id: string;
  auth_id: string;
  email: string;
  nickname: string;
  image: string;
  feature_flags: Record<string, boolean>;
  projects: ProjectType[];
  webhooks: WebhookType[];
  role: RoleType;
  permissions: PermissionType[];
}

export type UserHasPermissionsType = Partial<Record<PermissionCodeType | "is_owner", boolean>>;
