import { ReactNode } from "react";
import { Outlet, useParams } from "react-router-dom";

import { Avatar, Dialog, Drawer } from "../../../components";
import { getImageURL } from "../../../utils";
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

export function PublicEntityLayout({
  image_id,
  title,
  children,
}: {
  title: string;
  image_id?: string | null | undefined;
  children: ReactNode;
}) {
  const { project_id } = useParams();
  return (
    <div className="flex h-full max-h-full w-full flex-col gap-y-2 overflow-hidden bg-zinc-900">
      {title ? (
        <h2 className="flex flex-nowrap items-start gap-x-4 px-4 pt-2 font-lato text-3xl">
          {image_id ? <Avatar hasShowImage image={getImageURL(project_id as string, "images", image_id)} size="2xl" /> : null}
          <span>{title}</span>
        </h2>
      ) : null}
      {children}
    </div>
  );
}
