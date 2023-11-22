import { ProjectType, WebhookType } from "./EntityTypes";

export interface UserType {
  id: string;
  auth_id: string;
  email: string;
  nickname: string;
  image: string;
  projects: ProjectType[];
  webhooks: WebhookType[];
}
