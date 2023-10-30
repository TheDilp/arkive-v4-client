import { useStytchUser } from "@stytch/react";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export function AuthWrapper() {
  const { user } = useStytchUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/auth/sign-in");
    else navigate("/projects");
  }, [user]);

  return <Outlet />;
}
