import { navbarTitleAtom, useSetAtom } from "../../utils";
import { useEffect } from "react";

export function useChangeNavbarTitle(title: string) {
  const setNavbarTitleAtom = useSetAtom(navbarTitleAtom);

  useEffect(() => {
    if (title) {
      setNavbarTitleAtom(title);
      document.title = title;
    }
  }, [title, setNavbarTitleAtom]);
}
