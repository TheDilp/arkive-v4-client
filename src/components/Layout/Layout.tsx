import { Outlet } from "react-router-dom";

import { useBreakpoint } from "../../hooks";
import { Dialog, Drawer } from "../Overlay";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function ProjectLayout() {
  const { isLg } = useBreakpoint();
  return (
    <div className="flex h-full w-full flex-1 flex-col lg:flex-row">
      <Drawer />
      <Dialog />
      {isLg ? <Sidebar /> : null}

      <div className="flex h-full w-full flex-col">
        <Navbar />
        <div className="h-full p-4">
          <Outlet />
        </div>
        {!isLg ? <Sidebar /> : null}
      </div>
    </div>
  );
}

export function TablePageLayout({ children }: { children: JSX.Element | JSX.Element[] }) {
  return <div className="flex h-full w-full flex-col gap-y-4 text-white">{children}</div>;
}
