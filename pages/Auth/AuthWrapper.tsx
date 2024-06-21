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
    if (!loggedIn) {
      navigate("/auth/login");
    } else if (loggedIn && pathname.includes("auth/")) {
      navigate("/projects");
    }
  }, [loggedIn]);
  console.log(isFetching || isRefetching || (!data && !error && !loggedIn));
  console.log(loggedIn);
  if (isFetching || isRefetching || (!data && !error && !loggedIn)) return <Spinner />;
  return <Outlet />;
}
