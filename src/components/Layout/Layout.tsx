import { useSetAtom } from "jotai";
import ls from "localstorage-slim";
import { ReactNode, useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";

import { useBreakpoint, useGetEntity } from "../../hooks";
import { ProjectType } from "../../types";
import { projectAtom } from "../../utils";
import { Dialog, Drawer } from "../Overlay";
import { ContextMenu } from "../Overlay/ContextMenu";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function ProjectLayout() {
  const { project_id } = useParams();
  const { isLg } = useBreakpoint();
  const setProjectAtom = useSetAtom(projectAtom);
  const { data } = useGetEntity<ProjectType>(project_id as string, "projects", {}, { staleTime: 60 * 60 * 1 });
  useEffect(() => {
    if (data?.data) {
      setProjectAtom(data.data);
      ls.set("default_dice_color", data.data?.default_dice_color);
    }
  }, [data?.data]);
  return (
    <div className="flex h-screen w-screen flex-1 flex-col overflow-hidden lg:flex-row">
      <Dialog />
      <ContextMenu />
      {isLg ? <Sidebar /> : null}

      <div className="flex h-full w-full flex-col">
        <Navbar />
        <div className="h-[calc(100%-6rem)] overflow-hidden p-4 lg:h-[calc(100%-2rem)]">
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
