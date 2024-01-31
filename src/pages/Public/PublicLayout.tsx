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
    <div className="flex h-full max-h-full w-full flex-col gap-y-2 overflow-hidden">
      {title ? <h2 className="px-4 py-2 font-lato text-3xl">{title}</h2> : null}
      {children}
    </div>
  );
}

export function PublicCharacterResourceLayout({ children }: { children: ReactNode | ReactNode[] }) {
  return (
    <div className="relative flex h-full max-h-full flex-col overflow-y-auto overflow-x-hidden bg-zinc-900 lg:flex-row lg:flex-nowrap ">
      {children}
    </div>
  );
}

export function PublicCharacterResourceLinksLayout({ children }: { children: ReactNode | ReactNode[] }) {
  return (
    <div className="sticky top-8 hidden h-full max-h-full max-w-full flex-col gap-y-1 overflow-y-auto border-y border-zinc-800 bg-zinc-900 lg:flex lg:min-w-[20%] lg:max-w-[20%]">
      {children}
    </div>
  );
}
