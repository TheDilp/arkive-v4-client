import { atom } from "jotai";

import { PermissionCodeType, UserStatusType, UserType } from "../../types";
import { projectAtom } from ".";

export const userAtom = atom<UserType | null>(null);
export const userStatusAtom = atom<UserStatusType | null>(null);

export const isProjectOwnerAtom = atom((get) => {
  const owner_id = get(projectAtom)?.owner_id;
  const user_id = get(userAtom)?.id;
  if (owner_id && user_id) return owner_id === user_id;
  return false;
});

export const isGameOwnerAtom = atom((get) => {
  const owner_id = get(projectAtom)?.owner_id;
  const user_id = get(userAtom)?.id;

  if (owner_id && user_id) return owner_id === user_id;
  return false;
});

export const currentUserPermissionsAtom = atom<PermissionCodeType[]>([]);
export const userFeatureFlagsAtom = atom((get) => {
  return get(userAtom)?.feature_flags;
});

export const loggedInAtom = atom<boolean>(false);
