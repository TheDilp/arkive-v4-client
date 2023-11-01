import { useUser } from "@clerk/clerk-react";
import { useSetAtom } from "jotai";
import ls from "localstorage-slim";
import { ReactNode, useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";

import { useBreakpoint, useGetEntity, useGetUser } from "../../hooks";
import { ProjectType } from "../../types";
import { projectAtom, userAtom } from "../../utils";
import { Dialog, Drawer } from "../Overlay";
import { ContextMenu } from "../Overlay/ContextMenu";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function ProjectLayout() {
  const { project_id } = useParams();
  const { isLg } = useBreakpoint();
  const { user } = useUser();
  const { data } = useGetEntity<ProjectType>(project_id as string, "projects", {}, { staleTime: 60 * 60 * 1 });
  const { data: userData } = useGetUser({ data: { auth_id: user?.id }, fields: ["id"] }, { enabled: !!user?.id });
  const setProjectAtom = useSetAtom(projectAtom);
  const setUserAtom = useSetAtom(userAtom);
  useEffect(() => {
    if (data?.data) {
      setProjectAtom(data.data);
      ls.set("default_dice_color", data.data?.default_dice_color);
    }
  }, [data?.data]);

  useEffect(() => {
    if (userData) {
      setUserAtom(userData.data);
    }
  }, [userData?.data]);

  return (
    <div className="flex h-screen w-screen flex-1 flex-col overflow-hidden lg:flex-row">
      <Dialog />
      <ContextMenu />
      {isLg ? <Sidebar /> : null}

      <div className="flex h-full w-full flex-col lg:w-[calc(100%-4rem)]">
        <Navbar />
        <div className="h-[calc(100%-6rem)] max-w-full overflow-auto p-4 lg:h-[calc(100%-2rem)]">
          <Drawer />
          <Outlet />
        </div>
        {!isLg ? <Sidebar /> : null}
      </div>
    </div>
  );
}

export function TablePageLayout({ children }: { children: JSX.Element | JSX.Element[] | ReactNode | ReactNode[] | null }) {
  return <div className="flex h-full w-full flex-col gap-y-2 text-white">{children}</div>;
}
