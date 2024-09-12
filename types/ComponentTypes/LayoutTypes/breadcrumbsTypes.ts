import { AvailableEntityType } from "../../EntityTypes";

export interface BreadCrumbsType {
  items: { id: string; title: string; is_folder: boolean; parent_id: string | null; url?: string }[];
  type: AvailableEntityType | null;
}
