import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";

import { DialogAtomType, DrawerAtomType, NotificationType } from "../../types";

export const navbarTitleAtom = atom<string>("");
export const sidebarAtom = atom<boolean>(false);
export const drawerAtom = atomWithReset<DrawerAtomType>({ size: "md", title: "", position: "right", data: null, type: null });
export const dialogAtom = atomWithReset<DialogAtomType>({ position: "center", data: null, title: "", type: null, size: "md" });
export const notificationsAtom = atom<NotificationType[]>([]);
