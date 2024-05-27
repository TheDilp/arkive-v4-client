import { useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";

import { drawerAtom, userFeatureFlagsAtom } from "../../utils";

export function useToggledResetAtom() {
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const userFeatureFlags = useAtomValue(userFeatureFlagsAtom);

  return () => {
    if (userFeatureFlags?.close_drawer_on_save) resetDrawerAtom();
  };
}
