import { Outlet } from "react-router-dom";

import { Dialog } from "../../components";
import { PublicNavbar } from "./PublicNavbar";

export function PublicLayout() {
  return (
    <div className="flex h-screen max-h-screen w-screen flex-col p-4">
      <Dialog />
      <div className="mx-auto flex max-h-full w-full flex-1 flex-col lg:max-w-5xl">
        <PublicNavbar />
        <div className="flex-1 overflow-auto rounded bg-zinc-900 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
