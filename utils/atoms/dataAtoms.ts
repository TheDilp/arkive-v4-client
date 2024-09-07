import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";

import { GameType, PermissionType, ProjectType } from "../../types";

export const projectAtom = atomWithReset<ProjectType | null>(null);
export const gameAtom = atomWithReset<GameType | null>(null);
export const membersAtom = atom((get) => get(projectAtom)?.members || []);
export const permissionsAtom = atom<PermissionType[]>([]);
