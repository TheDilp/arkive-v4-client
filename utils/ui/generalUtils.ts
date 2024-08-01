import { IconEnum } from "../enums";

export function getSavingIcon(isMutating: boolean, hasChanges?: boolean) {
  if (hasChanges && isMutating) return IconEnum.loading;
  if (hasChanges && !isMutating) return IconEnum.error;
  if (!hasChanges && !isMutating) return IconEnum.check_double;
  return IconEnum.check_double;
}
export function getSavingTooltip(isMutating: boolean, hasChanges?: boolean) {
  if (hasChanges && isMutating) return "Saving...";
  if (hasChanges && !isMutating) return "There are unsaved changes.";
  if (!hasChanges && !isMutating) return "All changes saved.";
}
