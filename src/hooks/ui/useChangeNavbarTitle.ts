import { useSetAtom } from "jotai";
import { useEffect } from "react";

import { navbarTitleAtom } from "../../utils";

export function useChangeNavbarTitle(title: string) {
  const setNavbarTitleAtom = useSetAtom(navbarTitleAtom);

  useEffect(() => {
    if (title) {
      setNavbarTitleAtom(title);
      document.title = title;
    }
  }, [title, setNavbarTitleAtom]);
}
