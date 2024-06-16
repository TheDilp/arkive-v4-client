import { Variant } from "../../types";
import { IconEnum } from "../enums";

export function getDefaultAlertVariantIcon(variant: Variant) {
  if (variant === "info" || variant === "info-bordered") return IconEnum.info_circle;
  if (variant === "primary" || variant === "primary-bordered") return IconEnum.info_circle;
  if (variant === "secondary" || variant === "secondary-bordered") return IconEnum.info_circle;
  if (variant === "success" || variant === "success-bordered") return IconEnum.check_circle;
  if (variant === "warning" || variant === "warning-bordered") return IconEnum.warning;
  if (variant === "error" || variant === "error-bordered") return IconEnum.error;
  return IconEnum.info_circle;
}
