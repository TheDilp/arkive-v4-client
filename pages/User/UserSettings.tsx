import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useLayoutEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

// import { deepMerge } from "remirror";
import { Drawer, Navbar, Sidebar, Tabs } from "../../components";
import { useBreakpoint, useGetUser } from "../../hooks";
import { TabType } from "../../types";
import { currentUserPermissionsAtom, getProjectsViewNavItems, IconEnum, userAtom, userStatusAtom } from "../../utils";

export function UserSettings() {
  const { pathname } = useLocation();
  const { isLg } = useBreakpoint();
  const [view, setView] = useState<boolean | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const navigate = useNavigate();
  const user = useAtomValue(userStatusAtom);

  const tabs: TabType[] = [
    { id: "profile", label: "Profile", icon: IconEnum.user },
    { id: "webhooks", label: "Webhooks", icon: IconEnum.webhooks },
    { id: "feature_flags", label: "Feature flags", icon: IconEnum.webhooks },
  ];

  const setUserAtom = useSetAtom(userAtom);
  const setUserPermissions = useSetAtom(currentUserPermissionsAtom);

  const { data: userData } = useGetUser(
    {
      data: { id: user?.user_id as string },
      relations: {
        webhooks: true,
        roles: true,
      },
      fields: ["id", "feature_flags", "email", "nickname", "image"],
    },
    { enabled: !!user?.user_id }
  );

  useLayoutEffect(() => {
    if (pathname.endsWith("profile")) {
      setSelectedTab(0);
    } else if (pathname.endsWith("webhooks")) {
      setSelectedTab(1);
    } else if (pathname.endsWith("feature_flags")) {
      setSelectedTab(2);
    }
  }, [pathname]);

  useEffect(() => {
    if (userData?.data) {
      if (user) setUserAtom(userData.data);
      setUserPermissions((userData?.data?.role?.permissions || []).map((p) => p.code));
    }
  }, [userData?.data]);

  return (
    <div className="flex h-screen w-screen flex-1 flex-col overflow-hidden lg:flex-row">
      <Drawer />
      {isLg ? <Sidebar isLoading={false} isUsingPermissions={false} items={getProjectsViewNavItems(setView, view)} /> : null}
      <div className="flex flex-1 flex-col">
        <div className="w-full">
          <Navbar isDisabled={false} />
        </div>
        <div className="p-4">
          <Tabs
            onChange={(tab) => {
              navigate(`/user_settings/${tab.label.toLowerCase().replace(" ", "_")}`);
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
