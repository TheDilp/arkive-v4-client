import { Outlet } from "react-router-dom";

export function GameLayout() {
  return (
    <div className="h-full w-full bg-zinc-900">
      <Outlet />
    </div>
  );
}
