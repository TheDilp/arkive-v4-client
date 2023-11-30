import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Button, Dialog, Search } from "../../components";
import { IconEnum } from "../../utils";

export function PublicLayout() {
  const [search, setSearch] = useState<string | null>("");
  return (
    <div className="flex h-screen max-h-screen w-screen flex-col p-4">
      <Dialog />
      <div className="mx-auto flex max-h-full w-full flex-1 flex-col lg:max-w-5xl">
        <div className="flex items-center justify-end gap-x-2 text-lg">
          <div className="mb-1 h-8 min-h-[2rem] border-b border-zinc-600">
            {typeof search === "string" ? (
              <Search hasNoBackground isPublic name="test" onChange={() => {}} searchEntity="all" />
            ) : (
              <Button hasNoBackground icon={IconEnum.search} isIconOnly onClick={() => setSearch("")} />
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto rounded bg-zinc-900 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
