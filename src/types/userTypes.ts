import { ProjectType } from "./EntityTypes";

export interface UserType {
  id: string;
  auth_id: string;
  email: string;
  projects: ProjectType[];
}
