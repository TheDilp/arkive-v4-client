import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { Spinner } from "../../components";
import { useGetAuthStatus } from "../../hooks";
import { loggedInAtom } from "../../utils";

export function AuthWrapper() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const loggedIn = useAtomValue(loggedInAtom);

  const { data, isInitialLoading, isFetching } = useGetAuthStatus();

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
