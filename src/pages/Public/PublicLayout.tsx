import { Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="flex h-screen max-h-screen w-screen flex-col p-4">
      Search
      <div className="mx-auto max-h-full w-full flex-1 overflow-auto rounded bg-zinc-900 p-4 lg:max-w-5xl">
        <Outlet />
      </div>
    </div>
  );
}
