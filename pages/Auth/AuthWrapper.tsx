import { useAtomValue } from "jotai";
import { useLayoutEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { Spinner } from "../../components";
import { useGetAuthStatus } from "../../hooks";
import { loggedInAtom } from "../../utils";

export function AuthWrapper() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const loggedIn = useAtomValue(loggedInAtom);

  const { data, error, isRefetching, isFetching } = useGetAuthStatus();

  useLayoutEffect(() => {
    if (!loggedIn && !pathname.endsWith("/auth/login")) {
      navigate("/auth/login");
    } else if (loggedIn && (pathname.includes("auth/") || pathname === "/")) {
      navigate("/projects");
    }
  }, [loggedIn, pathname]);
  if (isFetching || isRefetching || (!data && !error && !loggedIn)) return <Spinner />;
  return <Outlet />;
}
