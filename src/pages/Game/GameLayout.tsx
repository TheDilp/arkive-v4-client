import { Outlet } from "react-router-dom";

export function GameLayout() {
  return (
    <div className="h-full w-full bg-zinc-950 p-4">
      <Outlet />
    </div>
  );
}
