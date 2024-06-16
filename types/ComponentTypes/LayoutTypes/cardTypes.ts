import { ProjectType } from "../../EntityTypes";

export interface BaseCardType {
  title: string;
  subtitle?: string;
  image?: string;
}

export interface ProjectCardType extends BaseCardType {
  id: string;
  feature_flags: ProjectType["feature_flags"];
}
