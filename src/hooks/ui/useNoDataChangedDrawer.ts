import { useResetAtom } from "jotai/utils";
import { useEffect } from "react";

import { hasChangedDataAtom } from "../../utils";

export function useNoDataChangedDrawer() {
  const resetHasChangedData = useResetAtom(hasChangedDataAtom);

  useEffect(() => {
    resetHasChangedData();
  }, []);
}
