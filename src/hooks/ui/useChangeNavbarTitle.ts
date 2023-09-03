import { useSetAtom } from "jotai";
import { useEffect } from "react";

import { navbarTitleAtom } from "../../utils";

export function useChangeNavbarTitle(title: string, enabled?: boolean) {
  const setNavbarTitleAtom = useSetAtom(navbarTitleAtom);

  useEffect(() => {
    if (title && (enabled || enabled === undefined) && document.title !== title) {
      setNavbarTitleAtom(title);
      document.title = title;
    }
  }, [title, setNavbarTitleAtom, enabled]);
}
