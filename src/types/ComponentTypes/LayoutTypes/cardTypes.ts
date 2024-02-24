import { AvailableIcons } from "../../../utils";

export interface BaseCardType {
  title: string;
  subtitle?: string;
  image?: string;
}

export interface ProjectCardType extends BaseCardType {
  id: string;
}

export interface ProjectDashboardInfoCardType extends BaseCardType {
  count: number;
  icon: AvailableIcons;
  latestItems: { id: string; title: string }[];
}
