import { RedirectToSignIn, SignedOut } from "@clerk/clerk-react";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { Outlet } from "react-router-dom";

// import { deepMerge } from "remirror";
import { Drawer, Navbar, Sidebar } from "../../components";
import { useBreakpoint } from "../../hooks";
import { drawerAtom, getProjectsViewNavItems } from "../../utils";

export function UserSettings() {
  const { isLg } = useBreakpoint();
  const setDrawer = useSetAtom(drawerAtom);
  const [view, setView] = useState<boolean | null>(null);

  return (
    <div className="flex h-screen w-screen flex-1 flex-col overflow-hidden lg:flex-row">
      <Drawer />
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      {isLg ? (
        <Sidebar isLoading={false} isUsingPermissions={false} items={getProjectsViewNavItems(setDrawer, setView, view)} />
      ) : null}
      <div className="flex flex-1 flex-col">
        <div className="w-full">
          <Navbar isDisabled={false} />
        </div>
        <Outlet />
      </div>

      {isLg ? null : (
        <Sidebar isLoading={false} isUsingPermissions={false} items={getProjectsViewNavItems(setDrawer, setView, view)} />
      )}
    </div>
  );
}
