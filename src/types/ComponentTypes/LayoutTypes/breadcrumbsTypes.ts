import { AvailableEntityType } from "../../EntityTypes";

export interface BreadCrumbsType {
  items: { id: string; title: string }[];
  type: AvailableEntityType | null;
}
