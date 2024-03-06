import { RedirectToSignIn, SignedOut, useUser } from "@clerk/clerk-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import ls from "localstorage-slim";
import { ReactNode, useEffect } from "react";
import { Navigate, Outlet, useBlocker, useParams } from "react-router-dom";

import { useBreakpoint, useGetEntity, useGetUser } from "../../hooks";
import { ProjectType } from "../../types";
import {
  contextMenuAtom,
  DefaultTagColor,
  dialogAtom,
  drawerAtom,
  hasChangedDataAtom,
  IconEnum,
  projectAtom,
  useNotifications,
  userAtom,
} from "../../utils";
import { Dialog, Drawer, Dropdown } from "../Overlay";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function ProjectLayout() {
  const { project_id } = useParams();
  const { isLg } = useBreakpoint();
  const { data, isInitialLoading } = useGetEntity<ProjectType>(
    project_id as string,
    "projects",
    {
      fields: ["id", "title", "owner_id"],
      relations: {
        members: true,
      },
    },
    { staleTime: 60 * 60 * 1 },
  );
  const { user } = useUser();
  const { data: userData, isInitialLoading: isInitialLoadingUser } = useGetUser(
    {
      data: { auth_id: user?.id },
      relations: {
        webhooks: true,
      },
      fields: ["id", "feature_flags"],
    },
    { enabled: !!user?.id },
  );
  const setUserAtom = useSetAtom(userAtom);

  useEffect(() => {
    if (userData) {
      if (user)
        user?.update({
          unsafeMetadata: {
            user_id: userData.data.id,
            project_id,
          },
        });
      setUserAtom(userData.data);
    }
  }, [userData?.data]);

  const setProjectAtom = useSetAtom(projectAtom);
  const setDialog = useSetAtom(dialogAtom);
  const hasChangedData = useAtomValue(hasChangedDataAtom);
  const drawer = useAtomValue(drawerAtom);
  const contextMenu = useAtomValue(contextMenuAtom);
  const createNotification = useNotifications();
  const resetDrawer = useResetAtom(drawerAtom);
  const resetHasChangedData = useResetAtom(hasChangedDataAtom);
  useEffect(() => {
    if (data?.data) {
      setProjectAtom(data.data);
      ls.set("default_dice_color", data.data?.default_dice_color || DefaultTagColor);
    }
  }, [data?.data]);

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

  return (
    <div className="flex h-screen w-screen flex-1 flex-col overflow-hidden lg:flex-row">
      <Dialog />
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <Dropdown allowedPlacements={["bottom", "right", "left"]} event={contextMenu.event} items={contextMenu?.items || []} />
      {isLg ? <Sidebar isLoading={isInitialLoading || isInitialLoadingUser} /> : null}

      <div className="flex h-full w-full flex-col lg:w-[calc(100%-4rem)]">
        <Navbar isDisabled={isInitialLoading || isInitialLoadingUser} />
        <div className="h-[calc(100%-6rem)] max-w-full overflow-hidden p-4 lg:h-[calc(100%-2rem)]">
          <Drawer />
          {isInitialLoading || isInitialLoadingUser ? null : <Outlet />}
        </div>
        {!isLg ? <Sidebar isLoading={isInitialLoading || isInitialLoadingUser} /> : null}
      </div>
    </div>
  );
}

export function TablePageLayout({ children }: { children: JSX.Element | JSX.Element[] | ReactNode | ReactNode[] | null }) {
  return <div className="flex h-full w-full flex-col gap-y-2 text-white">{children}</div>;
}
