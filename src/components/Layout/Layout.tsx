import { RedirectToSignIn, SignedOut, useUser } from "@clerk/clerk-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import ls from "localstorage-slim";
import { ReactNode, useEffect } from "react";
import { Navigate, Outlet, useBlocker, useParams } from "react-router-dom";

import { useBreakpoint, useGetEntities, useGetEntity, useGetUser } from "../../hooks";
import { PermissionType, ProjectType } from "../../types";
import {
  contextMenuAtom,
  currentUserPermissions,
  DefaultTagColor,
  dialogAtom,
  drawerAtom,
  hasChangedDataAtom,
  IconEnum,
  permissionsAtom,
  projectAtom,
  projectNavItems,
  useNotifications,
  userAtom,
} from "../../utils";
import { Dialog, Drawer, Dropdown } from "../Overlay";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

const sidebarItems = [...projectNavItems];
sidebarItems.unshift({ icon: IconEnum.dasboard, tooltip: "Dasboard", navigate: "/" });

export function ProjectLayout() {
  const { project_id } = useParams();
  const { isLg } = useBreakpoint();
  const { user } = useUser();

  const { data, isInitialLoading } = useGetEntity<ProjectType>(
    project_id as string,
    "projects",
    {
      fields: ["id", "title", "owner_id"],
      relations: {
        members: true,
        feature_flags: true,
      },
    },
    { staleTime: 60 * 60 * 1 },
  );
  const { data: userData, isInitialLoading: isInitialLoadingUser } = useGetUser(
    {
      data: { auth_id: user?.id as string, project_id },
      relations: {
        webhooks: true,
        roles: true,
      },
      fields: ["id", "feature_flags", "email"],
    },
    { enabled: !!user?.id && !!project_id },
  );

  const { data: permissions } = useGetEntities<PermissionType>({ fields: ["id", "title", "code"] }, "permissions", {
    staleTime: Infinity,
  });
  const setProjectAtom = useSetAtom(projectAtom);
  const setDialog = useSetAtom(dialogAtom);
  const setPermissions = useSetAtom(permissionsAtom);
  const setUserPermissions = useSetAtom(currentUserPermissions);
  const hasChangedData = useAtomValue(hasChangedDataAtom);
  const drawer = useAtomValue(drawerAtom);
  const contextMenu = useAtomValue(contextMenuAtom);
  const createNotification = useNotifications();
  const resetDrawer = useResetAtom(drawerAtom);
  const resetHasChangedData = useResetAtom(hasChangedDataAtom);

  const setUserAtom = useSetAtom(userAtom);

  useEffect(() => {
    if (userData?.data) {
      if (user)
        user?.update({
          unsafeMetadata: {
            user_id: userData?.data?.id,
            project_id,
          },
        });
      setUserAtom(userData.data);
      setUserPermissions((userData?.data?.role?.permissions || []).map((p) => p.code));
    }
  }, [userData?.data]);

  useEffect(() => {
    if (data?.data) {
      setProjectAtom(data.data);
      ls.set("default_dice_color", data.data?.default_dice_color || DefaultTagColor);
    }
  }, [data?.data]);

  useEffect(() => {
    if (permissions?.data) {
      setPermissions(permissions?.data);
    }
  }, [permissions]);

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
    data?.data?.owner_id !== userData?.data?.id &&
    (data?.data?.members?.length === 0 || !data?.data?.members?.some((m) => m?.id === userData?.data?.id)) &&
    !isInitialLoading &&
    !isInitialLoadingUser
  ) {
    createNotification({
      title: "You do not have access to this project.",
      variant: "error",
      icon: IconEnum.forbidden,
      timer: 5,
    });
    return <Navigate to="/" />;
  }

  if (!user?.unsafeMetadata?.project_id || isInitialLoading) return null;

  return (
    <div className="flex h-screen w-screen flex-1 flex-col overflow-hidden lg:flex-row">
      <Dialog />
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <Dropdown allowedPlacements={["bottom", "right", "left"]} event={contextMenu.event} items={contextMenu?.items || []} />
      {isLg ? <Sidebar isLoading={isInitialLoading || isInitialLoadingUser} isUsingPermissions items={sidebarItems} /> : null}

      <div className="flex h-full w-full flex-col lg:w-[calc(100%-4rem)]">
        <Navbar isDisabled={isInitialLoading || isInitialLoadingUser} />
        <div className="h-[calc(100%-6rem)] max-w-full overflow-hidden p-4 lg:h-[calc(100%-2rem)]">
          <Drawer />
          {isInitialLoading || isInitialLoadingUser ? null : <Outlet />}
        </div>
        {!isLg ? (
          <Sidebar isLoading={isInitialLoading || isInitialLoadingUser} isUsingPermissions items={sidebarItems} />
        ) : null}
      </div>
    </div>
  );
}

export function TablePageLayout({ children }: { children: JSX.Element | JSX.Element[] | ReactNode | ReactNode[] | null }) {
  return <div className="flex h-full w-full flex-col gap-y-2 text-white">{children}</div>;
}
