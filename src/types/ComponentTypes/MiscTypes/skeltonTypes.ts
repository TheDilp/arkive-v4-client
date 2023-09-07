import { AvailableEntityType } from "../../EntityTypes";

export type SkeletonType = {
  type:
    | "table"
    | "folder_view"
    | "breadcrumbs"
    | "drawer_form"
    | "editor"
    | "family_tree"
    | "character_profile"
    | "character_profile_main";
  limit?: number;
  entity_type?: AvailableEntityType;
};
