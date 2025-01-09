import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import ls from "localstorage-slim";
import { ReactNode, useEffect } from "react";
import { Navigate, Outlet, useBlocker, useLocation, useParams } from "react-router-dom";

import { useBreakpoint, useGetEntities, useGetEntity, useGetUser, useToggledResetAtom } from "../../hooks";
import { AvailableEntityType, PermissionType, ProjectType, TagType } from "../../types";
import {
  availableTagsAtom,
  contextMenuAtom,
  currentUserPermissionsAtom,
  DefaultTagColor,
  dialogAtom,
  Dice,
  drawerAtom,
  hasChangedDataAtom,
  historyAtom,
  IconEnum,
  navbarTitleAtom,
  permissionsAtom,
  projectAtom,
  projectNavItems,
  useNotifications,
  userAtom,
  userStatusAtom,
} from "../../utils";
import { TreeNav } from "../Layout";
import { Dialog, Drawer, Dropdown } from "../Overlay";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function ProjectLayout() {
  const { project_id, type } = useParams();
  const { isLg } = useBreakpoint();
  const { pathname } = useLocation();
  const userStatus = useAtomValue(userStatusAtom);

  const { data: projectData, isInitialLoading } = useGetEntity<ProjectType>(
    project_id as string,
    "projects",
    {
      fields: ["id", "title", "owner_id", "default_project_font"],
      relations: {
        members: true,
        feature_flags: true,
        owner: true,
        game_system: true,
        tags: true,
      },
    },
    { staleTime: 60 * 60 * 1 }
  );
  const { data: userData, isInitialLoading: isInitialLoadingUser } = useGetUser(
    {
      data: { id: userStatus?.user_id as string, project_id },
      relations: {
        webhooks: true,
        roles: true,
      },
      fields: ["id", "feature_flags", "email"],
    },
    { enabled: !!userStatus?.user_id && !!project_id }
  );
  const { data: permissions, isInitialLoading: isInitialLoadingPermissions } = useGetEntities<PermissionType>(
    {
      fields: ["id", "title", "code"],
      orderBy: [
        { field: "parent_category", sort: "asc" },
        { field: "title", sort: "asc" },
      ],
    },
    "permissions",
    {
      enabled: !!userStatus?.user_id && !!project_id,
      staleTime: Infinity,
    }
  );
  const { data: allTags } = useGetEntities<TagType>({ fields: [] }, "tags", {
    isAll: true,
    enabled: !isInitialLoading && !!projectData && !!project_id,
  });
  const title = useAtomValue(navbarTitleAtom);
  const [history, setHistory] = useAtom(historyAtom);
  const [projectAtomData, setProjectAtom] = useAtom(projectAtom);
  const setDialog = useSetAtom(dialogAtom);
  const setPermissions = useSetAtom(permissionsAtom);
  const setUserPermissions = useSetAtom(currentUserPermissionsAtom);
  const setAllTags = useSetAtom(availableTagsAtom);
  const hasChangedData = useAtomValue(hasChangedDataAtom);
  const drawer = useAtomValue(drawerAtom);
  const contextMenu = useAtomValue(contextMenuAtom);
  const createNotification = useNotifications();
  const resetDrawer = useToggledResetAtom();
  const resetHasChangedData = useResetAtom(hasChangedDataAtom);

  const setUserAtom = useSetAtom(userAtom);

  useEffect(() => {
    if (userData?.data) {
      setUserAtom(userData.data);
      setUserPermissions((userData?.data?.role?.permissions || []).map((p) => p.code));
      ls.set("default_dice_color", userData?.data?.feature_flags?.default_dice_color || DefaultTagColor);

      Dice.updateConfig({
        theme: userData?.data?.feature_flags?.dice_theme || "default",
      });
    }
  }, [userData?.data]);

  useEffect(() => {
    if (projectData?.data) {
      setProjectAtom(projectData.data);
    }
  }, [projectData?.data]);
  useEffect(() => {
    if (permissions?.data) {
      setPermissions(permissions?.data);
    }
  }, [permissions]);
  useEffect(() => {
    const parsedTitle = (title?.split("|")?.at(-1) || "The Arkive").trim();
    if (parsedTitle === "undefined") return;
    if (history.length >= 10) {
      if (history[0].link === pathname || parsedTitle === "The Arkive") return;
      if (parsedTitle === "undefined") return;
      setHistory([{ label: parsedTitle, link: pathname }]);
    }

    if (history.length === 0 && parsedTitle === "The Arkive") return;
    if (history.at(0)?.link === pathname) return;
    if (parsedTitle === "undefined") return;
    setHistory([{ label: parsedTitle, link: pathname }, ...history].slice(0, 10));
  }, [title]);

  useEffect(() => {
    if (allTags?.data) setAllTags(allTags?.data || []);
  }, [allTags]);

  const { proceed, reset } = useBlocker(({ currentLocation, nextLocation }) => {
    if (hasChangedData && !!drawer?.title && currentLocation.pathname !== nextLocation.pathname) {
      if (proceed) {
        setDialog((prev) => ({
          ...prev,
          title: "You have unsaved changes - are you sure you want to proceed?",
          confirm: {
            label: "Proceed",
            variant: "primary",
            icon: IconEnum.chevron_right,
            action: () => {
              resetDrawer();
              resetHasChangedData();
              proceed();
            },
          },
          cancel: {
            label: "Cancel",
            variant: "info",
            action: reset,
          },
          isOverlay: true,
        }));
        return true;
      }
      return true;
    }

    return false;
  });

  if (
    projectData?.data?.owner_id !== userData?.data?.id &&
    (projectData?.data?.members?.length === 0 || !projectData?.data?.members?.some((m) => m?.id === userData?.data?.id)) &&
    !isInitialLoading &&
    !isInitialLoadingUser &&
    !isInitialLoadingPermissions
  ) {
    createNotification({
      title: "You do not have access to this project.",
      variant: "error",
      icon: IconEnum.forbidden,
      timer: 5,
    });
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-screen w-screen flex-1 flex-col overflow-hidden lg:flex-row">
      <Dialog />

      <Dropdown allowedPlacements={["bottom", "right", "left"]} event={contextMenu.event} items={contextMenu?.items || []} />
      {isLg ? (
        <Sidebar isLoading={isInitialLoading || isInitialLoadingUser} isUsingPermissions items={projectNavItems} />
      ) : null}

      <div className="flex h-full w-full flex-col lg:w-[calc(100%-4rem)]">
        <Navbar isDisabled={isInitialLoading || isInitialLoadingUser} />
        <div className="flex h-[calc(100%-6rem)] max-w-full flex-nowrap overflow-hidden lg:h-[calc(100%-2rem)]">
          <TreeNav type={type as AvailableEntityType} />
          <Drawer />
          <div className="flex h-full w-full max-w-full p-4">
            {isInitialLoading || isInitialLoadingUser || isInitialLoadingPermissions || !projectAtomData ? null : <Outlet />}
          </div>
        </div>
        {!isLg ? (
          <Sidebar isLoading={isInitialLoading || isInitialLoadingUser} isUsingPermissions items={projectNavItems} />
        ) : null}
      </div>
    </div>
  );
}

export function TablePageLayout({ children }: { children: JSX.Element | JSX.Element[] | ReactNode | ReactNode[] | null }) {
  return <div className="flex h-full w-full flex-col gap-y-2 text-white">{children}</div>;
}

export function AuthLayout({ children }: { children: JSX.Element | JSX.Element[] | ReactNode | ReactNode[] | null }) {
  return (
    <div className="max-w-screen flex h-screen max-h-screen w-screen flex-col items-center justify-center overflow-auto p-4 lg:overflow-hidden">
      {children}
    </div>
  );
}
