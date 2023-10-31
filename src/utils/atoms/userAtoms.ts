import { atom } from "jotai";

import { UserType } from "../../types";
import { projectAtom } from "./uiAtoms";

export const userAtom = atom<UserType | null>(null);
export const userSettingsAtom = atom(() => {
  return {
    show_image_folder_view: true,
    show_image_table_view: true,
  };
});

export const isUserOwnerAtom = atom((get) => {
  const owner_id = get(projectAtom)?.owner_id;
  const user_id = get(userAtom)?.id;

  if (owner_id && user_id) return owner_id === user_id;
  return false;
});
