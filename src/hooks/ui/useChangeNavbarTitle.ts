import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import { navbarTitleAtom, projectAtom } from "../../utils";

export function useChangeNavbarTitle(title: string, enabled?: boolean) {
  const setNavbarTitleAtom = useSetAtom(navbarTitleAtom);
  const projectData = useAtomValue(projectAtom);
  useEffect(() => {
    if (projectData?.title && title && (enabled || enabled === undefined)) {
      setNavbarTitleAtom(`${projectData?.title} | ${title}`);
      document.title = `${projectData?.title} | ${title}`;
    }
  }, [projectData?.title, title, setNavbarTitleAtom, enabled]);
}
