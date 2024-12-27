import { useAtomValue } from "jotai";
import ls from "localstorage-slim";
import { useEffect, useLayoutEffect } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { Spinner } from "../../components";
import { useUpdateAuthStatus } from "../../hooks";
import { IconEnum, loggedInAtom, semverCompare, useNotifications, userStatusAtom } from "../../utils";

export function AuthWrapper() {
  const { project_id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const createNotification = useNotifications();
  const { reset, mutate: updateAuthStatus, isLoading: isUpdatingStatus, isIdle } = useUpdateAuthStatus();

  const loggedIn = useAtomValue(loggedInAtom);
  const userStatus = useAtomValue(userStatusAtom);

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
    if (!isUpdatingStatus && !isIdle) {
      if (loggedIn && (pathname.includes("auth/") || pathname === "/")) {
        navigate("/projects");
      }
    }
  }, [loggedIn, pathname, userStatus?.status, isUpdatingStatus, isIdle]);

  useLayoutEffect(() => {
    // eslint-disable-next-line no-console
    console.info(navigator.onLine);
    if (navigator.onLine) {
      reset();
      updateAuthStatus({ project_id: project_id === "undefined" || !project_id ? null : project_id });
    }
  }, [project_id]);
  if (
    ((!userStatus && (isUpdatingStatus || isIdle)) || (!!userStatus && !!project_id && !userStatus?.project_id)) &&
    navigator.onLine
  )
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <Spinner />
      </div>
    );

  if (userStatus?.status === "authenticated" || !navigator.onLine) return <Outlet />;
  if (userStatus?.status === "unauthenticated" && navigator.onLine) {
    window.location.replace("https://thearkive.app/sign-in");
  }
  return null;
}
