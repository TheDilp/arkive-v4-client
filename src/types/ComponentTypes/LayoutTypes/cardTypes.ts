import { AvailableIcons } from "../../../utils";
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

export interface ProjectDashboardInfoCardType extends BaseCardType {
  count: number;
  icon: AvailableIcons;
  latestItems: { id: string; title: string }[];
}
