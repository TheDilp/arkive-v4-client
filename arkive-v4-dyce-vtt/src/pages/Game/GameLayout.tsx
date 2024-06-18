import { Outlet } from "react-router-dom";

import { Navbar } from "../../../../components";
import { useNavbarTitle } from "../../../../hooks";

export function GameLayout() {
  useNavbarTitle("", true);
  return (
    <div className="h-full w-full bg-zinc-950">
      <Navbar isDisabled />
      <Outlet />
    </div>
  );
}
