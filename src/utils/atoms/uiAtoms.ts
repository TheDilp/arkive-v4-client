import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";

import { ContextMenuAtomType, DialogAtomType, DrawerAtomType, NotificationType, ProjectType } from "../../types";
import { BreadCrumbsType as BreadcrumbsType } from "../../types/ComponentTypes/LayoutTypes/breadcrumbsTypes";

export const projectAtom = atom<ProjectType | null>(null);

export const navbarTitleAtom = atom<string>("");
export const breadcrumbsAtom = atom<BreadcrumbsType>({ items: [], type: null });
export const drawerAtom = atomWithReset<DrawerAtomType>({ size: "md", title: "", position: "right", data: null, type: null });
export const dialogAtom = atomWithReset<DialogAtomType>({ position: "center", data: null, title: "", type: null, size: "md" });
export const contextMenuAtom = atomWithReset<ContextMenuAtomType>({ event: null, items: null });
export const notificationsAtom = atom<NotificationType[]>([]);
export const mentionDropdownAtom = atom<boolean>(false);
