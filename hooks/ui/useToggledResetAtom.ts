import { useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";

import { drawerAtom, hasChangedDataAtom, userFeatureFlagsAtom } from "../../utils";

export function useToggledResetAtom() {
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const userFeatureFlags = useAtomValue(userFeatureFlagsAtom);
  const setHasChangedData = useSetAtom(hasChangedDataAtom);

  return (override?: boolean) => {
    setHasChangedData(false);
    if (userFeatureFlags?.close_drawer_on_save || override) resetDrawerAtom();
  };
}
