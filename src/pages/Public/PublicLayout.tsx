import { ReactNode } from "react";
import { Outlet } from "react-router-dom";

import { Dialog, Drawer } from "../../components";
import { PublicNavbar } from "./PublicNavbar";

export function PublicLayout() {
  return (
    <div className="flex h-screen max-h-screen w-screen flex-col p-4">
      <Dialog />
      <div className="mx-auto flex max-h-full w-full flex-1 flex-col lg:max-w-5xl">
        <PublicNavbar />
        <Drawer isPublic />
        <div className="flex-1 overflow-auto rounded border border-zinc-700">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function PublicEntityLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col gap-y-2">
      {title ? <h2 className="px-4 py-2 font-lato text-3xl">{title}</h2> : null}
      {children}
    </div>
  );
}
