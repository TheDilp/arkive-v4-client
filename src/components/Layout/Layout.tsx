import { Outlet } from "react-router-dom";

import { useBreakpoint } from "../../hooks";
import { Dialog, Drawer } from "../Overlay";
import { ContextMenu } from "../Overlay/ContextMenu";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function ProjectLayout() {
  const { isLg } = useBreakpoint();
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

export function TablePageLayout({ children }: { children: JSX.Element | JSX.Element[] }) {
  return <div className="flex h-full w-full flex-col gap-y-2 overflow-hidden text-white">{children}</div>;
}
