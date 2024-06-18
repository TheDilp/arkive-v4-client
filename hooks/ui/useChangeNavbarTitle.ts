import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import { moduleAtom, navbarTitleAtom, projectAtom } from "../../utils";

export function useNavbarTitle(title: string, enabled: boolean) {
  const setNavbarTitleAtom = useSetAtom(navbarTitleAtom);
  const module = useAtomValue(moduleAtom);
  const projectData = useAtomValue(projectAtom);
  useEffect(() => {
    const coreTitle = module ? "Dyce VTT" : "The Arkive";
    if (projectData?.title && title && enabled) {
      setNavbarTitleAtom(`${projectData?.title} | ${title || ""}`);
      document.title = `${title?.split("|")?.at(-1) || coreTitle}`;
    } else if (!projectData?.title || !title) {
      setNavbarTitleAtom(coreTitle);
      document.title = coreTitle;
    }
  }, [projectData?.title, title, setNavbarTitleAtom, enabled, module]);
}
