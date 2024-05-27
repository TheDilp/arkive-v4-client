import { RedirectToSignIn, SignedOut } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

// import { deepMerge } from "remirror";
import { Drawer, Navbar, Sidebar, Tabs } from "../../components";
import { useBreakpoint } from "../../hooks";
import { TabType } from "../../types";
import { getProjectsViewNavItems, IconEnum } from "../../utils";

export function UserSettings() {
  const { pathname } = useLocation();
  const { isLg } = useBreakpoint();
  const [view, setView] = useState<boolean | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const navigate = useNavigate();

  const tabs: TabType[] = [
    { id: "1", label: "Webhooks", icon: IconEnum.webhooks },
    { id: "2", label: "Feature flags", icon: IconEnum.webhooks },
  ];

  useEffect(() => {
    if (pathname.endsWith("webhooks")) {
      setSelectedTab(0);
    } else if (pathname.endsWith("feature_flags")) {
      setSelectedTab(1);
    }
  }, [pathname]);

  return (
    <div className="flex h-screen w-screen flex-1 flex-col overflow-hidden lg:flex-row">
      <Drawer />
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      {isLg ? <Sidebar isLoading={false} isUsingPermissions={false} items={getProjectsViewNavItems(setView, view)} /> : null}
      <div className="flex flex-1 flex-col">
        <div className="w-full">
          <Navbar isDisabled={false} />
        </div>
        <div className="p-4">
          <Tabs
            onChange={(tab, index) => {
              navigate(`/user_settings/${tab.label.toLowerCase().replace(" ", "_")}`);
              setSelectedTab(index);
            }}
            selectedTab={selectedTab}
            tabs={tabs}
          />
          <Outlet />
        </div>
      </div>

      {isLg ? null : <Sidebar isLoading={false} isUsingPermissions={false} items={getProjectsViewNavItems(setView, view)} />}
    </div>
  );
}
