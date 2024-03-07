import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";

import { PermissionType, ProjectType } from "../../types";

export const projectAtom = atomWithReset<ProjectType | null>(null);
export const rolesAtom = atom((get) => get(projectAtom)?.roles || []);
export const membersAtom = atom((get) => get(projectAtom)?.members || []);
export const permissionsAtom = atom<PermissionType[]>([]);
