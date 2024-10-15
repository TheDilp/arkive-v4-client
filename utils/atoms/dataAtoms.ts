import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";

import { PermissionType, ProjectType } from "../../types";

export const projectAtom = atomWithReset<ProjectType | null>(null);
export const gameSystemAtom = atom((get) => get(projectAtom)?.game_system);
export const membersAtom = atom((get) => get(projectAtom)?.members || []);
export const permissionsAtom = atom<PermissionType[]>([]);
export const availableTagsAtom = atom((get) => get(projectAtom)?.tags || []);
