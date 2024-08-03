import { PermissionCodeType, PermissionType, ProjectType, RoleType, WebhookType } from "./EntityTypes";

export interface UserType {
  id: string;
  email: string;
  nickname: string;
  image: string;
  feature_flags: Record<string, string | boolean>;
  projects: ProjectType[];
  webhooks: WebhookType[];
  role: RoleType;
  permissions: PermissionType[];
}

export type UserStatusType = {
  status: "authenticated" | "unauthenticated";
  user_id: string;
  project_id: string | null;
  name: string | null;
  image_url: string | null;
};

export type UserHasPermissionsType = Partial<Record<PermissionCodeType | "is_owner", boolean>>;
