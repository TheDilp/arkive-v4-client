import { useAtomValue } from "jotai";

import { navbarTitleAtom } from "../../utils";

export function Navbar() {
  const navbarTitle = useAtomValue(navbarTitleAtom);
  return (
    <div className="h-16 min-h-[4rem] border-b border-zinc-800 bg-zinc-900 shadow">
      <h1 className="flex h-full select-none items-center pl-4 font-merriweather text-3xl text-white">
        <span>{navbarTitle || "The Arkive"}</span>
      </h1>
    </div>
  );
}
