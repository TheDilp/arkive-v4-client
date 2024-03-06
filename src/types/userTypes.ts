import { PermissionType, ProjectType, RoleType, WebhookType } from "./EntityTypes";

export interface UserType {
  id: string;
  auth_id: string;
  email: string;
  nickname: string;
  image: string;
  feature_flags: Record<string, boolean>;
  projects: ProjectType[];
  webhooks: WebhookType[];
  roles: RoleType[];
  permissions: PermissionType[];
}
