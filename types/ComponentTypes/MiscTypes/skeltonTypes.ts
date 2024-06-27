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
    | "character_profile_main"
    | "calendar_view"
    | "expanded_tag"
    | "conversations"
    | "avatar"
    | "project_view"
    | "sidebar";
  limit?: number;
  entity_type?: AvailableEntityType;
  isFullWidth?: boolean;
};
