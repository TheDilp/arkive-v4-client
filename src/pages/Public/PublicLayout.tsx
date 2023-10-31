import { Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="flex h-screen w-screen p-4">
      <div className="mx-auto max-h-full w-full overflow-auto rounded bg-zinc-900 p-4 lg:max-w-5xl">
        <Outlet />
      </div>
    </div>
  );
}
