import { atom } from "jotai";

import { PermissionCodeType, UserType } from "../../types";
import { projectAtom } from ".";

export const userAtom = atom<UserType | null>(null);
export const userSettingsAtom = atom(() => {
  return {
    show_image_folder_view: true,
    show_image_table_view: true,
  };
});

export const isProjectOwnerAtom = atom((get) => {
  const owner_id = get(projectAtom)?.owner_id;
  const user_id = get(userAtom)?.id;

  if (owner_id && user_id) return owner_id === user_id;
  return false;
});
export const currentUserPermissionsAtom = atom<PermissionCodeType[]>([]);
export const userFeatureFlagsAtom = atom((get) => {
  return get(userAtom)?.feature_flags;
});
