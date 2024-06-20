import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { AuthContext } from "../../context";

export function AuthWrapper() {
  const { pathname } = useLocation();
  const auth = useContext(AuthContext);
  return <>{!auth?.tokens && !pathname.endsWith("/auth/login") ? <Navigate to={"/auth/login"} /> : <Outlet />}</>;
}
