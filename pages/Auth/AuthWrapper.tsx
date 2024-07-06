import { useAtomValue } from "jotai";
import ls from "localstorage-slim";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { Spinner } from "../../components";
import { useGetAuthStatus } from "../../hooks";
import { IconEnum, loggedInAtom, semverCompare, useNotifications } from "../../utils";

export function AuthWrapper() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const createNotification = useNotifications();
  const loggedIn = useAtomValue(loggedInAtom);

  const { data, isInitialLoading, isFetching } = useGetAuthStatus();

  useEffect(() => {
    const savedVersion = (ls.get("version") || "0.0.1") as string;
    // eslint-disable-next-line no-undef
    const currentVersion = APP_VERSION || "0.0.1";

    const isCurrentAhead = semverCompare(currentVersion, savedVersion);
    if (!savedVersion || isCurrentAhead) {
      createNotification({
        variant: "info",
        title: "A new version of the app is available. Please refresh the page to update.",
        timer: 10,
        icon: IconEnum.info_circle,
        hasNoTruncate: true,
      });

      ls.set("version", currentVersion);
    }
  }, []);

  useEffect(() => {
    if (!isInitialLoading && !isFetching) {
      if (!loggedIn && !pathname.endsWith("/auth/login")) {
        navigate("/auth/login");
      } else if (loggedIn && (pathname.includes("auth/") || pathname === "/")) {
        navigate("/projects");
      }
    }
  }, [loggedIn, pathname]);

  if (!data && (isInitialLoading || isFetching))
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <Spinner />
      </div>
    );

  return <Outlet />;
}

